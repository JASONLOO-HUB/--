import type { InformationGap, Question } from '../types';

/**
 * 追问补充页独立预览用种子数据 —— 南方周末经历。
 * 模拟用户已提交语音/文字描述后，系统返回追问状态。
 */
export const FOLLOWUP_PREVIEW_SEED: {
  transcript: string;
  summary: Record<string, unknown>;
  followup: {
    shouldFollowup: boolean;
    confidenceScore: number;
    informationGaps: InformationGap[];
    questions: Question[];
    followupCount: number;
    reason: string;
  };
} = {
  transcript:
    '我之前在南方周末实习了半年，主要做特稿。做了一个关于北京飞絮治理的深度报道，联系了好几个政府部门和大学研究机构。那篇稿子后来阅读量十万加了。我还做了一些其他的选题，比如咖啡师兼职经济什么的。',
  summary: {
    company: '南方周末',
    position: '特稿工作室实习生',
    duration: '2023.12-2024.06',
    responsibilities: ['深度选题全流程操作', '资料搜集与采访对象挖掘', '深度访谈与成稿'],
    achievements: ['成稿《毛白杨生，毛白杨死》阅读量10万+'],
    transferable_skills: ['快速调研陌生行业', '多方资源整合', '信息结构化输出'],
  },
  followup: {
    shouldFollowup: true,
    confidenceScore: 55,
    informationGaps: [
      { dimension: '量化指标', description: '具体对接了多少家机构？传播效果的排名或互动数据？', severity: 'critical' },
      { dimension: '项目广度', description: '除了"毛白杨"选题，在南方周末期间是否有其他项目？', severity: 'important' },
      { dimension: '方法论', description: '调研和采访的具体方法论是什么？如何快速切入陌生领域？', severity: 'important' },
    ],
    questions: [
      {
        id: 'q1',
        question:
          '在"毛白杨"选题中，你具体对接了多少家政府与科研机构？成稿发布后在平台上的排名和互动数据大概是多少？',
        type: 'choice',
        options: [
          '对接5家以上，评论互动500+',
          '对接3-5家，评论互动200-500',
          '对接1-3家，互动数据不确定',
          '其他（请补充）',
        ],
        priority: 'high',
        reason: '量化数据能大幅提升简历说服力',
      },
      {
        id: 'q2',
        question: '在南方周末实习期间，除了"毛白杨"深度选题，你还做过什么其他项目？',
        type: 'text',
        priority: 'high',
        reason: '更多项目经历可以展现经验的广度和适应性',
      },
      {
        id: 'q3',
        question: '你是如何快速切入"飞絮治理"这个陌生领域的？',
        type: 'choice',
        options: [
          '先看政策文件，再找关键人物访谈',
          '先做桌面调研，再实地走访',
          '综合多种方法，有自己的调研SOP',
        ],
        priority: 'medium',
        reason: '方法论描述有助于将"新闻调研"包装为"行业研究"能力',
      },
      {
        id: 'q4',
        question: '在南方周末期间，你是否参与过社群运营或内部知识管理的项目？',
        type: 'text',
        priority: 'medium',
        reason: '社群经历可对标JD中"开发者社区建设"的要求',
      },
    ],
    followupCount: 0,
    reason: '关键量化指标和项目广度信息缺失',
  },
};
