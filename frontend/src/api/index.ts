import axios, { AxiosError } from 'axios';
import { mockApi } from './mock';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

/** 后端 AppException 返回的 detail 结构 */
interface AppExceptionDetail {
  code?: string;
  message?: string;
  suggestion?: string;
  details?: Record<string, unknown>;
}

/** FastAPI 422 校验错误项 */
interface ValidationErrorItem {
  loc?: (string | number)[];
  msg?: string;
  type?: string;
}

function getMessageFromDetail(detail: unknown): string {
  if (typeof detail === 'string') return detail;
  // 后端 AppException：{ code, message, suggestion, details }
  if (detail && typeof detail === 'object' && !Array.isArray(detail) && 'message' in detail) {
    const msg = (detail as AppExceptionDetail).message;
    if (typeof msg === 'string') return msg;
  }
  if (detail && typeof detail === 'object' && !Array.isArray(detail) && 'suggestion' in detail) {
    const sug = (detail as AppExceptionDetail).suggestion;
    if (typeof sug === 'string') return sug;
  }
  // FastAPI 422 校验错误：[{ loc, msg, type }, ...]
  if (Array.isArray(detail) && detail.length > 0) {
    const messages = (detail as ValidationErrorItem[])
      .map((e) => e.msg)
      .filter((m): m is string => typeof m === 'string');
    if (messages.length) return messages.join('；');
  }
  return '';
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string | AppExceptionDetail }>) => {
    const status = error.response?.status;
    const rawDetail = error.response?.data?.detail;
    const detailStr = getMessageFromDetail(rawDetail) || (typeof rawDetail === 'string' ? rawDetail : '');
    let message = detailStr || error.message || '请求失败';
    if (status === 422 && !detailStr) {
      message = '请求参数校验失败，请检查填写内容（如岗位名称、JD 长度与格式）';
    }

    // 生产禁Mock后的典型报错给出可操作提示
    if (
      message.includes('生产模式禁止Mock回退') ||
      message.includes('未初始化') ||
      message.includes('配置缺失')
    ) {
      message = '后端AI服务当前不可用（可能是生产模式下未配置密钥或服务未初始化）。请联系管理员检查 ARK/ASR 配置。';
    } else if (
      (rawDetail && typeof rawDetail === 'object' && (rawDetail as AppExceptionDetail).code === 'LLM_002') ||
      message.includes('超时') ||
      error.code === 'ECONNABORTED'
    ) {
      message = 'AI响应超时，请简化输入或稍后重试';
    } else if (status === 503) {
      message = detailStr || '服务暂时不可用，请稍后重试。';
    }

    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);

const realSessionApi = {
  create: () => api.post('/session'),
  get: (sessionId: string) => api.get(`/session/${sessionId}`),
};

const realResumeApi = {
  upload: (file: File, sessionId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('session_id', sessionId);
    return api.post('/upload-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (sessionId: string) => api.delete(`/resumes/${sessionId}`),
  update: (resumeId: string, parsedData: Record<string, unknown>) => 
    api.put(`/resumes/${resumeId}`, parsedData),
  getModules: (sessionId: string) => api.get(`/resumes/modules/${sessionId}`),
  getSections: (resumeId: string, moduleType: string) => 
    api.get(`/resumes/sections/${resumeId}/${moduleType}`),
  getSection: (sectionId: string) => api.get(`/resumes/section/${sectionId}`),
  getSectionStatus: (sectionId: string) => api.get(`/resume/section/${sectionId}`),
  saveSection: (sectionId: string, rewrittenContent: string, matchScore: number) =>
    api.post('/resumes/save', null, {
      params: { section_id: sectionId, rewritten_content: rewrittenContent, match_score: matchScore }
    }),
  confirmSection: (sectionId: string) => api.post('/resume/confirm', null, {
    params: { section_id: sectionId }
  }),
  getInputGuidance: (sectionId: string) => api.get(`/resume/input-guidance/${sectionId}`),
};

const realJobTargetApi = {
  create: (sessionId: string, targets: Array<{ job_title: string; jd_text: string }>) =>
    api.post('/job-targets', { targets }, { params: { session_id: sessionId } }),
};

/** 与 axios 使用同一 base，避免流式请求 404 */
function getAnalyzeStreamUrl(sessionId: string): string {
  const base = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');
  return `${base}/analyze/stream?session_id=${encodeURIComponent(sessionId)}`;
}

const realAnalysisApi = {
  trigger: (sessionId: string) => api.post('/analyze', null, { params: { session_id: sessionId } }),

  /**
   * 流式分析：通过 SSE 接收进度与结果，避免长请求超时。
   * 保底 300s 超时，超时后 abort 并 reject「分析耗时过长，请重试」。
   */
  triggerStream: (
    sessionId: string,
    callbacks: {
      onProgress?: (message: string) => void;
      onDone?: () => void;
    }
  ): Promise<void> => {
    const url = getAnalyzeStreamUrl(sessionId);
    const ANALYSIS_STREAM_TIMEOUT_MS = 300000; // 300s 保底
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ANALYSIS_STREAM_TIMEOUT_MS);

    const cleanup = () => {
      clearTimeout(timeoutId);
    };

    return new Promise((resolve, reject) => {
      fetch(url, {
        method: 'POST',
        headers: { Accept: 'text/event-stream' },
        signal: controller.signal,
      })
        .then((res) => {
          if (!res.ok) {
            cleanup();
            return res.json().then((body) => {
              const msg = getMessageFromDetail(body?.detail) || res.statusText;
              reject(new Error(msg));
            }).catch(() => reject(new Error(res.statusText)));
          }
          if (!res.body) {
            cleanup();
            reject(new Error('无响应体'));
            return;
          }
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          const processChunk = () => {
            reader.read().then(({ done, value }) => {
              if (done) {
                cleanup();
                resolve();
                return;
              }
              buffer += decoder.decode(value, { stream: true });
              const blocks = buffer.split(/\n\n/);
              buffer = blocks.pop() ?? '';
              for (const block of blocks) {
                let event = '';
                for (const line of block.split('\n')) {
                  if (line.startsWith('event: ')) event = line.slice(7).trim();
                  else if (line.startsWith('data: ')) {
                    try {
                      const data = JSON.parse(line.slice(6)) as { message?: string; step?: string };
                      if ((event === 'progress' || event === 'heartbeat') && data.message) callbacks.onProgress?.(data.message);
                      if (event === 'done') callbacks.onDone?.();
                      if (event === 'error' && data.message) {
                        cleanup();
                        reject(new Error(data.message));
                        return;
                      }
                    } catch (_) { /* ignore */ }
                  }
                }
              }
              processChunk();
            }).catch((err) => {
              cleanup();
              if (err.name === 'AbortError') {
                reject(new Error('分析耗时过长，请重试'));
              } else {
                reject(err);
              }
            });
          };
          processChunk();
        })
        .catch((err) => {
          cleanup();
          if (err.name === 'AbortError') {
            reject(new Error('分析耗时过长，请重试'));
          } else {
            reject(err);
          }
        });
    });
  },

  get: (sessionId: string) => api.get(`/analysis/${sessionId}`),
  tuneForJob: (sessionId: string, jobTargetId: string) =>
    api.post('/job-tuning', null, {
      params: { session_id: sessionId, job_target_id: jobTargetId },
      timeout: 180000,
    }),
};

const LLM_LONG_TIMEOUT = 180000; // 规划/改写/语音等长 LLM 请求 180s

const realVoiceApi = {
  input: (sectionId: string, audioData: string, moduleType: string) =>
    api.post('/voice/input', {
      section_id: sectionId,
      audio_data: audioData,
      module_type: moduleType,
    }, { timeout: LLM_LONG_TIMEOUT }),
  transcribe: (audioData: string) =>
    api.post('/voice/transcribe', { audio_data: audioData }, { timeout: LLM_LONG_TIMEOUT }),
  transcribeByUrl: (audioUrl: string, format: string = 'wav', sectionId?: string, moduleType?: string) =>
    api.post('/voice/transcribe-url', {
      audio_url: audioUrl,
      format,
      section_id: sectionId,
      module_type: moduleType,
    }, { timeout: LLM_LONG_TIMEOUT }),
  summarize: (transcript: string, sectionId: string, jdText: string, jobTargetId?: string) =>
    api.post('/voice/summarize', null, {
      params: { transcript, section_id: sectionId, jd_text: jdText, job_target_id: jobTargetId },
      timeout: LLM_LONG_TIMEOUT,
    }),
  askFollowup: (sectionId: string, collectedInfo: Record<string, unknown>, jdText: string, followupCount: number = 0, voiceTranscript?: string, jobTargetId?: string) =>
    api.post('/resume/ask-followup', {
      section_id: sectionId,
      collected_info: collectedInfo,
      jd_text: jdText,
      followup_count: followupCount,
      voice_transcript: voiceTranscript,
      job_target_id: jobTargetId,
    }, { timeout: LLM_LONG_TIMEOUT }),
  answerFollowup: (sectionId: string, answers: Record<string, string>, jdText: string, jobTargetId?: string) =>
    api.post('/resume/answer-followup', answers, {
      params: { section_id: sectionId, jd_text: jdText, job_target_id: jobTargetId },
      timeout: LLM_LONG_TIMEOUT,
    }),
  streamTranscribe: {
    connect: (
      onResult: (text: string, isFinal: boolean) => void,
      onError: (error: string) => void,
      onComplete: () => void
    ) => {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = window.location.host;
      const wsUrl = `${wsProtocol}//${wsHost}/api/voice/stream`;
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket 已连接');
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.error) {
            onError(data.error);
          } else {
            onResult(data.text, data.is_final);
          }
        } catch (e) {
          console.error('解析 WebSocket 消息失败:', e);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket 错误:', error);
        onError('WebSocket 连接错误');
      };
      
      ws.onclose = () => {
        console.log('WebSocket 已关闭');
        onComplete();
      };
      
      return {
        sendAudio: (audioData: ArrayBuffer) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(audioData);
          }
        },
        sendEnd: () => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'end' }));
          }
        },
        close: () => {
          ws.close();
        }
      };
    }
  }
};

const realRewriteApi = {
  rewrite: (sectionId: string, originalContent: string, additionalInfo: Record<string, unknown>, jdText: string, multiJdAnalysis?: Record<string, unknown>, jobTargetId?: string) =>
    api.post('/resume/rewrite', {
      section_id: sectionId,
      original_content: originalContent,
      additional_info: additionalInfo,
      jd_text: jdText,
      multi_jd_analysis: multiJdAnalysis,
      job_target_id: jobTargetId,
    }, { timeout: 180000 }),
};

const realPlanApi = {
  generate: (sessionId: string, currentDate?: string, targetDate?: string) =>
    api.post('/plan/generate', {
      session_id: sessionId,
      current_date: currentDate,
      target_date: targetDate,
    }, { timeout: 180000 }),
  get: (sessionId: string) => api.get(`/plan/${sessionId}`),
  getSummary: (sessionId: string) => api.get(`/plan/summary/${sessionId}`),
};

export const sessionApi = USE_MOCK ? mockApi.sessionApi : realSessionApi;
export const resumeApi = USE_MOCK ? mockApi.resumeApi : realResumeApi;
export const jobTargetApi = USE_MOCK ? mockApi.jobTargetApi : realJobTargetApi;
export const analysisApi = USE_MOCK ? mockApi.analysisApi : realAnalysisApi;
export const voiceApi = USE_MOCK ? mockApi.voiceApi : realVoiceApi;
export const rewriteApi = USE_MOCK ? mockApi.rewriteApi : realRewriteApi;
export const planApi = USE_MOCK ? mockApi.planApi : realPlanApi;

export default api;
