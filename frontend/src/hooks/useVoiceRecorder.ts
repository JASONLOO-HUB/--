import { useState, useRef, useCallback, useEffect } from 'react';
import { voiceApi } from '../api';

const MAX_DURATION = 90;

interface UseVoiceRecorderResult {
  isRecording: boolean;
  isProcessing: boolean;
  transcript: string;
  error: string | null;
  remainingTime: number;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetTranscript: () => void;
}

export function useVoiceRecorder(): UseVoiceRecorderResult {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState(MAX_DURATION);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const wsRef = useRef<ReturnType<typeof voiceApi.streamTranscribe.connect> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (autoStopRef.current) {
      clearTimeout(autoStopRef.current);
      autoStopRef.current = null;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current) return;
    
    clearTimers();
    setIsRecording(false);
    setIsProcessing(true);
    
    mediaRecorderRef.current.stop();
    
    mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    
    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      try {
        const ws = voiceApi.streamTranscribe.connect(
          (text, isFinal) => {
            setTranscript(prev => isFinal ? text : prev + text);
          },
          (err) => {
            setError(err);
            setIsProcessing(false);
          },
          () => {
            setIsProcessing(false);
          }
        );
        
        wsRef.current = ws;
        
        const arrayBuffer = await audioBlob.arrayBuffer();
        ws.sendAudio(arrayBuffer);
        ws.sendEnd();
        
      } catch (err) {
        setError('语音识别失败，请重试');
        setIsProcessing(false);
        console.error('语音识别失败:', err);
      }
    };
  }, [clearTimers]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setTranscript('');
      setRemainingTime(MAX_DURATION);
      audioChunksRef.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.start(100);
      setIsRecording(true);
      
      timerRef.current = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      autoStopRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          setError('已达到最大录音时长（90秒），自动停止录音');
          stopRecording();
        }
      }, MAX_DURATION * 1000);
      
    } catch (err) {
      setError('无法访问麦克风，请检查权限设置');
      console.error('麦克风访问失败:', err);
    }
  }, [stopRecording]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
    setRemainingTime(MAX_DURATION);
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [clearTimers]);

  return {
    isRecording,
    isProcessing,
    transcript,
    error,
    remainingTime,
    startRecording,
    stopRecording,
    resetTranscript,
  };
}
