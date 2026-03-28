import type { ModuleInfo, ResumeSection } from '../types';

type MockResponse<T> = Promise<{ data: T }>;

function response<T>(data: T): MockResponse<T> {
  return Promise.resolve({ data });
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MOCK_SESSION_ID = 'mock-session';
const MOCK_RESUME_ID = 'mock-resume';

/* ────────────────────────────────────────────
 * 简历原文 (from CV_test.pdf)
 * ──────────────────────────────────────────── */

const ORIGINAL_NANFANG = `南方周末特稿工作室，实习生\t2023.12-2024.06
独立完成2个陌生领域深度选题的全流程操作，独立资料搜集、采访对象挖掘、深度访谈、成稿
采写"北京城市飞絮治理"时，单独对接政府部门以及科研机构。梳理、整合北京绿化政策变迁，并将"硬"政策内容嵌入新闻叙事。同时，通俗解释无絮毛白杨的培养技术，用紧凑叙事串联两支科研团队前后30年的科研努力。成稿《毛白杨生、毛白杨死》阅读量超过十万加，点赞量1479。`;

const ORIGINAL_ZHENSHIGUSHI = `真实故事计划，作者实习生\t2024.09-2025.01
联系采访对象、采访以及写作，期间独立完成被拐儿童解清帅回归原生家庭一年后的深度报道。报道聚焦被拐儿童的身份认同摇摆，成稿约7000字，是第一篇关注解清帅的深度报道。`;

const ORIGINAL_WANGYI = `网易文创看客栏目，内容运营实习生\t2023.09-2023.12
独立负责选题全流程操作：负责选题申报、采访到稿件撰写。
产出高流量内容：入职三个月期间完成4篇非虚构稿件，其中"断粮动物园"及"技校老师自白"阅读量分别达6.1万、9.6万，点赞量447、1027，两篇稿件流量及获赞数均为同期公众号发布内容前三。`;

const ORIGINAL_CAIJING = `财经大健康栏目，视频实习生\t2023.04-2023.05
独立完成大健康行业资讯的选题申报、撰写短视频文案、独立剪辑，每天产出一到两条时长1-2分钟的短视频资讯内容。`;

const ORIGINAL_WEIJIAN = `独立学生媒体"微见Microsee"主编\t2024-2025
接手订阅量不足500、阅读波动的学生媒体，主导"西政学生起诉重庆地铁案"深度报道。突破法理型报道框架，以特稿形式聚焦当事人心态转变，微信公众号4.3万阅读、293次点赞。`;

/* ────────────────────────────────────────────
 * 改写目标 (from test.docx — 南方周末段)
 * ──────────────────────────────────────────── */

export const REWRITTEN_NANFANG = `内容运营实习生 | 南方周末 | 2023年12月 - 2024年6月

项目一：独立负责从0到1的深度特稿采写，涵盖城市治理、社会经济等议题，成稿城市治理深度报道《毛白杨生，毛白杨死》。
内容策划&执行：自主发现并全程负责"北京飞絮治理"这一公共议题。在无明确线索情况下，通过政策文件梳理与初步访谈，独立完成从选题申报、采访对象挖掘到成稿的全流程。
深度访谈&资源整合：单独对接并访谈北京市园林绿化局、中国林业大学等5家政府与科研机构，深入梳理北京绿化政策30年变迁。通过高效沟通，将复杂的遗传育种学知识及政策背景，转化为公众可感知的故事线。
传播效果：成稿发布后获得10万+阅读量、1479点赞，流量位列当周全平台报道前10%，用户评论互动超500条，成功将专业政策议题推向公共讨论。
热点捕捉：在广州市限购政策松绑后一周内，快速执行市场调研。通过实地"walk-in"方式深度访谈房产中介、销售经理等30余位一线从业者，并结合对公司高层的访谈，捕捉市场真实情绪与微观案例。

项目二：社会经济现象选题《零工经济中的咖啡师》
热点捕捉&用户调研：发起针对年轻人兼职生态的选题。通过小红书平台内容趋势洞察，主动私信联系并访谈20+位兼职咖啡师，同时实地走访20家广州线下咖啡门店，收集一线鲜活故事。
内容创作：撰写4000字深度特稿，通过细腻的个体叙事折射宏观就业图景，展现了将社会趋势转化为感人故事的文字功底。

项目三：跨媒体线上"读稿会" —— 社群运营与知识项目管理
社群搭建&运营：独立发起并运营跨媒体从业者线上社群"读稿会"。负责从主题策划、嘉宾邀请、活动主持到会后复盘的全流程。
项目推进：通过"人搭人"方式，成功邀请8位资深记者进行内容创作分享，构建起一个稳定活跃的50+人行业交流社群。
内容沉淀：每次活动后产出结构化会议纪要，提炼创作方法论，部分内容沉淀为内部培训素材，初步形成了"选题挖掘-叙事技巧-传播复盘"的SOP。`;

/* ────────────────────────────────────────────
 * Modules & Sections
 * ──────────────────────────────────────────── */

const mockModules: ModuleInfo[] = [
  { type: 'education', count: 2, has_content: true },
  { type: 'internship', count: 4, has_content: true },
  { type: 'project', count: 1, has_content: true },
  { type: 'skill', count: 1, has_content: true },
];

const mockSectionsByModule: Record<string, ResumeSection[]> = {
  education: [
    {
      id: 'edu-1',
      resume_id: MOCK_RESUME_ID,
      module_type: 'education',
      original_content: '中国传媒大学（211）传播学 本科（2021.09-2025.06）\n主修课程：数字媒体营销策略（90）人工智能与编程在新闻传播中的运用（93）危机传播（93）科技新闻报道（92）',
      rewritten_content: null,
      match_score: null,
      status: 'pending',
      followup_count: 0,
      voice_input_used: false,
    },
    {
      id: 'edu-2',
      resume_id: MOCK_RESUME_ID,
      module_type: 'education',
      original_content: '香港中文大学（QS 34）新闻学 硕士（2025.09-2026.11）\n主修课程：中文新闻写作 媒体伦理与道德 信息图表与数据可视化',
      rewritten_content: null,
      match_score: null,
      status: 'pending',
      followup_count: 0,
      voice_input_used: false,
    },
  ],
  internship: [
    {
      id: 'intern-1',
      resume_id: MOCK_RESUME_ID,
      module_type: 'internship',
      original_content: ORIGINAL_NANFANG,
      rewritten_content: null,
      match_score: null,
      status: 'pending',
      followup_count: 0,
      voice_input_used: false,
    },
    {
      id: 'intern-2',
      resume_id: MOCK_RESUME_ID,
      module_type: 'internship',
      original_content: ORIGINAL_ZHENSHIGUSHI,
      rewritten_content: null,
      match_score: null,
      status: 'pending',
      followup_count: 0,
      voice_input_used: false,
    },
    {
      id: 'intern-3',
      resume_id: MOCK_RESUME_ID,
      module_type: 'internship',
      original_content: ORIGINAL_WANGYI,
      rewritten_content: null,
      match_score: null,
      status: 'pending',
      followup_count: 0,
      voice_input_used: false,
    },
    {
      id: 'intern-4',
      resume_id: MOCK_RESUME_ID,
      module_type: 'internship',
      original_content: ORIGINAL_CAIJING,
      rewritten_content: null,
      match_score: null,
      status: 'pending',
      followup_count: 0,
      voice_input_used: false,
    },
  ],
  project: [
    {
      id: 'project-1',
      resume_id: MOCK_RESUME_ID,
      module_type: 'project',
      original_content: ORIGINAL_WEIJIAN,
      rewritten_content: null,
      match_score: null,
      status: 'pending',
      followup_count: 0,
      voice_input_used: false,
    },
  ],
  skill: [
    {
      id: 'skill-1',
      resume_id: MOCK_RESUME_ID,
      module_type: 'skill',
      original_content:
        '新闻业务：快速调研陌生行业，熟练检索并整理资料、信息核查；擅长搭建叙事\n视频剪辑：熟练使用PR、AU等音视频剪辑软件\n语言：英语流利（雅思7.5）\n分析技巧：EXCEL数据清理与可视化；AI工具提效；Prompt Engineering\n个人特质：好奇心；计划性；注重逻辑推理；不拖延',
      rewritten_content: null,
      match_score: null,
      status: 'pending',
      followup_count: 0,
      voice_input_used: false,
    },
  ],
};

/* ────────────────────────────────────────────
 * JD: 腾讯WXG企业微信-AI生态
 * ──────────────────────────────────────────── */

const JD_TEXT = `腾讯WXG企业微信-AI生态（产品通道-行业应用）

岗位职责：
1. 参与设计企业微信AI生态的开放及合作策略，构建与AI生态产业链各类型玩家的合作模式（如OpenClaw生态建设），负责与头部AI厂商的联合产品方案设计与落地；
2. 参与构建企业微信AI开发者社区、技能生态、AI服务生态等相关生态能力；
3. 快速分析理解AI相关产品与技术进展，进行高质量的商业分析与产品研究输出；

要求：
1. 27届应届毕业生，尽早可以到岗实习（广州/深圳）
2. 具备AI理解力、较好的动手能力，对开发者人群有理解和洞察（加分项）
3. 具备一定的产品策略、商业分析经验`;

/* ────────────────────────────────────────────
 * 分析结果 mock
 * ──────────────────────────────────────────── */

const mockAnalysis = {
  average_score: 52,
  results: [
    {
      id: 'job-1',
      job_title: '企业微信AI生态-产品策略',
      overall_score: 52,
      jd_text: JD_TEXT,
      ability_gaps: [
        { ability: 'AI产品理解力', gap: '简历中缺少直接的AI产品使用或分析经历，仅提及"AI工具提效"和"Prompt Engineering"，未展开具体应用场景', priority: 'high' as const },
        { ability: '产品策略与商业分析', gap: '现有经历以内容运营为主，缺少产品策略制定、竞品分析或商业模型研究的案例', priority: 'high' as const },
        { ability: '开发者生态认知', gap: '无开发者社区运营或API/SDK产品相关经验，对开发者人群缺乏直接接触', priority: 'medium' as const },
        { ability: '数据分析深度', gap: '提及Excel和数据可视化，但缺少用户行为分析、漏斗转化、AB测试等产品分析方法论', priority: 'medium' as const },
      ],
      strengths: [
        '卓越的信息搜集与深度调研能力（可迁移到商业分析与竞品研究）',
        '强大的跨领域快速学习能力（两周内掌握陌生行业并产出深度内容）',
        '出色的资源整合与沟通推动力（独立对接政府/科研/企业多方资源）',
        '数据驱动的运营思维（内容数据复盘、标题优化SOP）',
        '扎实的AI工具使用基础（Prompt Engineering、Cursor、Python）',
      ],
      recommendations: [
        '将"深度选题调研"重新包装为"行业快速调研与商业分析"，突出方法论可迁移性',
        '补充AI产品分析案例，如对比主流AI Agent平台的功能/生态差异',
        '将"社群运营（读稿会）"包装为"社区运营与生态建设"经验，呼应"AI开发者社区"的JD要求',
        '强化数据分析叙事，将内容运营的数据复盘扩展为"用户行为洞察-策略迭代"闭环',
      ],
      jd_analysis: {
        job_titles: ['企业微信AI生态-产品策略'],
        explicit_requirements: [
          { requirement: 'AI生态合作策略设计', generalizable_description: '制定平台开放策略与合作伙伴管理' },
          { requirement: '联合产品方案设计与落地', generalizable_description: '跨团队产品协作与项目推进' },
          { requirement: 'AI开发者社区建设', generalizable_description: '社区/社群运营与生态搭建' },
          { requirement: 'AI产品与技术分析', generalizable_description: '快速学习新领域并产出结构化研究' },
          { requirement: '商业分析与产品研究输出', generalizable_description: '调研报告撰写与商业洞察提炼' },
        ],
        implicit_requirements: [
          { requirement: '对B端产品有基本理解', liberal_arts_mapping: '通过深度调研快速掌握陌生领域的能力', example_scenarios: ['独立调研并撰写城市治理深度报道', '快速理解遗传育种学等专业知识'] },
          { requirement: '跨部门沟通协调能力', liberal_arts_mapping: '多方资源整合与推进能力', example_scenarios: ['对接5家政府与科研机构', '邀请8位资深记者组建社群'] },
        ],
        key_skills: ['产品策略', '商业分析', 'AI理解力', '开发者生态', '用户调研', '竞品分析'],
        responsibilities: ['AI生态策略设计', '合作伙伴管理', '开发者社区建设', '产品研究与分析'],
        common_requirements: {
          skills: ['产品策略', '商业分析', 'AI理解力', '快速学习', '项目管理'],
          responsibilities: ['生态策略设计', '开发者社区运营', '产品研究输出'],
          keywords: ['AI生态', '产品策略', '商业分析', '开发者', '合作模式', 'OpenClaw'],
        },
        recommended_focus: [
          '将"深度调研→洞察→内容输出"的工作模式重新定义为"行业研究→商业分析→策略建议"',
          '突出AI工具使用经历，补充1-2个AI产品体验分析案例',
          '将社群运营（读稿会50+人社区）重新定位为"社区建设与生态运营"经验',
          '强调"数据驱动决策"的能力，将内容复盘包装为"产品分析与迭代优化"',
        ],
      },
      dimensional_analysis: {
        experience_match: {
          score: 40,
          evidence: ['无直接的产品策略或AI产品经验', '内容运营经历与产品岗位有一定距离'],
          gaps: ['缺乏产品策略制定经历', '无开发者生态相关经验', '无AI产品分析案例'],
          strict_comment: '整体经历以新闻采写和内容运营为主，与AI产品策略岗位存在显著的"经历类型差距"。但调研能力、信息整合能力和快速学习能力有较强的可迁移性。',
        },
        rewrite_potential: {
          score: 80,
          evidence: [
            '深度调研能力可直接包装为"商业分析与行业研究"',
            '社群运营经历可转化为"社区/生态建设"叙事',
            'AI工具使用基础（Prompt Engineering、Python）可强化',
            '数据复盘思维可升级为产品分析方法论',
          ],
          strict_comment: '虽然经历类型不匹配，但核心能力高度可迁移。通过系统性改写和补充AI产品分析案例，匹配度可以大幅提升。',
        },
        expected_match_after_rewrite: 70,
        implementation_difficulty: 'medium' as const,
        gaps: ['产品策略经验', '开发者生态认知', 'AI产品分析案例'],
      },
    },
  ],
  multi_jd_analysis: {
    common_requirements: {
      skills: ['产品策略', '商业分析', 'AI理解力', '快速学习', '项目管理'],
      responsibilities: ['生态策略设计', '开发者社区运营', '产品研究输出'],
      keywords: ['AI生态', '产品策略', '商业分析', '开发者', '合作模式', 'OpenClaw'],
    },
    recommended_focus: [
      '将深度调研能力包装为行业研究与商业分析',
      '突出AI工具使用基础与学习热情',
      '强调社群运营经验对标社区建设能力',
      '补充数据驱动决策的叙事',
    ],
  },
};

/* ────────────────────────────────────────────
 * 规划结果 mock
 * ──────────────────────────────────────────── */

const mockPlanSummary = {
  timeline: [],
  recommendations: [
    '补充1-2个AI产品竞品分析案例（如对比Coze/Dify/扣子等Agent平台的功能、开放策略、生态打法差异），形成结构化分析报告',
    '将南方周末"深度调研→洞察→内容输出"的方法论升级为"行业研究→商业洞察→策略建议"叙事，在简历中显式使用产品/商业分析词汇',
    '利用Cursor/Python动手能力做一个小型AI产品Demo或数据分析项目，展现"具备AI理解力和较好的动手能力"',
  ],
  milestones: [
    {
      date: '4月上旬',
      milestone: '完成简历全部经历的改写优化，重点包装调研与分析能力',
      type: 'internship' as const,
      internship_suggestions: [
        '南方周末经历重写：突出"快速调研陌生行业→提炼洞察→结构化输出"的分析能力',
        '网易看客经历重写：强调"数据驱动选题→内容复盘→策略迭代"的闭环思维',
        '将"读稿会"社群运营经历包装为"社区建设与生态运营"',
      ],
    },
    {
      date: '4月中旬',
      milestone: '产出2份AI产品竞品分析报告，作为面试展示材料',
      type: 'project' as const,
      project_suggestions: [
        '选取2-3个企业级AI Agent平台（如Coze、Dify、百度智能云千帆），从功能、开放策略、开发者生态角度进行对比分析',
        '关注企业微信+AI的行业案例，积累对"AI生态合作模式"的理解',
        '产出PPT或文档形式的分析报告，展示商业分析输出能力',
      ],
    },
    {
      date: '5月上旬',
      milestone: '完成1个AI应用Demo或数据分析项目，体现动手能力',
      type: 'project' as const,
      project_suggestions: [
        '用Cursor+Python搭建一个简单的AI Agent应用（如自动分析JD并推荐简历优化方向）',
        '或做一个开发者社区内容分析项目（爬取GitHub/掘金等平台数据，分析开发者关注趋势）',
      ],
    },
    {
      date: '5月下旬',
      milestone: '开始目标岗位投递并进行模拟面试',
      type: 'internship' as const,
      internship_suggestions: [
        '准备3个核心面试故事：调研能力、数据驱动决策、AI产品理解',
        '准备1-2个反问问题，展示对企业微信AI生态的思考',
        '关注腾讯其他BG的产品策略岗位作为备选',
      ],
    },
  ],
  pitfalls: [
    {
      risk: '经历描述停留在"做了什么"层面',
      why: '产品岗位更关注"为什么这么做"和"结果如何量化"，纯叙事性描述无法展示策略思维',
      mitigation: '每段经历采用"挑战/洞察→策略/行动→可量化结果"的STAR-L结构',
    },
    {
      risk: '过度强调新闻/内容标签',
      why: '岗位JD没有提及内容运营，过度突出会让HR认为"方向不匹配"',
      mitigation: '用"调研分析""行业研究""策略输出"替代"选题""采写""稿件"等新闻词汇',
    },
    {
      risk: 'AI产品理解停留在"用过AI工具"层面',
      why: 'JD要求"快速分析理解AI产品与技术进展"，单纯的工具使用不等于产品理解',
      mitigation: '补充对AI产品生态的系统性思考，如Agent平台竞争格局、API开放策略等',
    },
  ],
  priority_guide: '优先完善简历中可迁移的高匹配经历（南方周末调研→商业分析，看客数据复盘→产品分析），再补充AI产品分析的增量案例',
  priority_rationale: '岗位核心看"产品策略+商业分析+AI理解力"三个维度。通过改写现有经历可以覆盖前两个维度的基本面，而AI理解力需要通过新增项目来补强',
  urgency_assessment: '时间适中但需抓紧——距离实习投递窗口约1-2个月，需并行推进简历优化和项目补充',
  planning_mode: '能力迁移+增量补充模式',
  judgement_basis: '基于现有经历的可迁移性评估与岗位核心要求的差距分析',
  overall_score: 52,
  progress: {
    total_sections: 8,
    rewritten_sections: 0,
    confirmed_sections: 0,
    completion_rate: 0,
  },
};

/* ────────────────────────────────────────────
 * 南方周末改写结果 mock（与 test.docx 对齐）
 * ──────────────────────────────────────────── */

const NANFANG_REWRITE_RESULT = {
  rewritten_content: REWRITTEN_NANFANG,
  match_score: 72,
  key_highlights: [
    '将"深度选题全流程操作"重构为"从0到1的项目全流程"叙事，匹配产品策略岗对项目管理能力的要求',
    '补充了具体机构数量（5家）、传播效果排名（前10%）、互动数据（500+评论），大幅提升量化可信度',
    '新增"广州限购政策调研"项目，展现热点捕捉与市场调研能力，呼应JD中"快速分析理解产品与市场"的要求',
    '新增"零工经济"选题和"读稿会"社群运营，分别展示用户调研能力和社区建设经验',
    '使用"内容策划&执行""深度访谈&资源整合""热点捕捉&用户调研""社群搭建&运营"等结构化小标题，提升可读性',
  ],
  exaggerations: [
    {
      original: '独立完成2个陌生领域深度选题的全流程操作',
      rewritten: '独立负责从0到1的深度特稿采写，涵盖城市治理、社会经济等议题',
      exaggeration_type: '表述升级',
      exaggeration_level: '合理包装',
      factual_basis: '基于实际完成的选题工作，将"全流程操作"升级为更专业的"从0到1"表述',
      interview_preparation: '面试时可展开描述"从0到1"的具体步骤：选题发现→资料搜集→采访→成稿',
    },
    {
      original: '阅读量超过十万加',
      rewritten: '获得10万+阅读量、1479点赞，流量位列当周全平台报道前10%',
      exaggeration_type: '数据补充',
      exaggeration_level: '合理包装',
      factual_basis: '阅读量和点赞为真实数据，"前10%"需确认具体排名',
      interview_preparation: '建议准备该周平台整体数据或截图，佐证排名描述',
    },
  ],
  overall_exaggeration_level: '合理包装',
  proof_needed: [
    '准备成稿《毛白杨生、毛白杨死》的数据截图（阅读量、点赞、评论数）',
    '确认"流量位列当周全平台报道前10%"的具体依据',
    '"读稿会"社群的运营记录或会议纪要截图',
    '广州限购调研的30余位访谈记录（可模糊化展示）',
  ],
  content_decisions: {
    kept: ['深度特稿采写核心经历', '采访对象挖掘与资源整合', '《毛白杨生》传播效果数据'],
    condensed: ['原文中较为笼统的"全流程操作"描述被拆解为具体模块'],
    removed: ['原文中"通俗解释无絮毛白杨培养技术"等过于细节的新闻叙事描述'],
  },
  ats_optimization: {
    keywords_included: ['内容策划', '深度访谈', '资源整合', '传播效果', '热点捕捉', '用户调研', '社群运营', '项目管理', 'SOP'],
    keywords_missing: ['AI', '产品策略', '商业分析', '开发者', '数据分析'],
    format_compliance: '采用项目分块+小标题结构，符合ATS扫描友好格式',
  },
  reasoning_process: `改写策略：将新闻采写经历重新定义为"调研→分析→结构化输出"的产品分析能力展示。

1. 结构重组：将原文笼统的"全流程操作"拆解为3个具体项目，每个项目使用"能力标签+具体行动+量化结果"的结构。
2. 语言迁移：将新闻行业术语替换为更通用的商业/产品词汇，如"选题"→"项目"，"采写"→"调研与输出"。
3. 内容补充：根据追问获得的信息，补充了广州限购调研、零工经济选题、读稿会社群运营等经历，展示项目广度。
4. 量化强化：补充了机构数量（5家）、访谈人数（30余位/20+位）、社群规模（50+人）、排名（前10%）等数据。
5. 能力对标：社群运营→社区建设，调研能力→商业分析，热点捕捉→市场洞察，每一项都指向JD的核心要求。`,
};

/* ────────────────────────────────────────────
 * Mock API
 * ──────────────────────────────────────────── */

export const mockApi = {
  sessionApi: {
    create: () => response({ session_id: MOCK_SESSION_ID }),
    get: () => response({ session_id: MOCK_SESSION_ID, status: 'active' }),
  },

  resumeApi: {
    upload: (_file: File, _sessionId: string) =>
      response({
        resume_id: MOCK_RESUME_ID,
        raw_text: '卢俊成 简历全文',
        parsed_data: {
          education: [
            { school: '中国传媒大学', start_time: '2021.09', end_time: '2025.06', degree: '本科', grades: '' },
            { school: '香港中文大学', start_time: '2025.09', end_time: '2026.11', degree: '硕士', grades: '' },
          ],
          internship: [
            { company: '南方周末', time: '2023.12-2024.06', position: '特稿工作室实习生', work_content: '深度选题全流程操作' },
            { company: '真实故事计划', time: '2024.09-2025.01', position: '作者实习生', work_content: '深度报道采写' },
            { company: '网易文创看客栏目', time: '2023.09-2023.12', position: '内容运营实习生', work_content: '非虚构稿件全流程' },
            { company: '财经大健康栏目', time: '2023.04-2023.05', position: '视频实习生', work_content: '短视频资讯制作' },
          ],
          project: [
            { project_name: '微见Microsee', time: '2024-2025', responsibility: '主编', project_content: '学生媒体运营与深度报道' },
          ],
          skill: ['微软办公', '秀米', 'EXCEL', 'PR', 'AU', 'Flourish', 'Python', 'SQL', 'Cursor', 'Stitch', 'Figma', '提示词工程'],
          personal_info: { name: '卢俊成', phone: '18934372901', email: 'juncheng6393@gmail.com' },
        },
      }),
    delete: () => response({ success: true }),
    update: () => response({ success: true }),
    getModules: () => response({ resume_id: MOCK_RESUME_ID, modules: mockModules }),
    getSections: (_resumeId: string, moduleType: string) =>
      response({ module_type: moduleType, sections: mockSectionsByModule[moduleType] || [] }),
    getSection: (sectionId: string) =>
      response(Object.values(mockSectionsByModule).flat().find((s) => s.id === sectionId) || null),
    getSectionStatus: () => response({ status: 'pending' }),
    saveSection: () => response({ success: true }),
    confirmSection: () => response({ success: true }),
    getInputGuidance: async (sectionId: string) => {
      await wait(600);
      const guidanceMap: Record<string, { guidance_text: string; star_hints: string[] }> = {
        'intern-1': {
          guidance_text: '补充南方周末这段：选题怎么来的、采访对接与成稿过程、阅读量/互动等数据（STAR：背景→任务→行动→结果）',
          star_hints: [
            'S: 你是怎么发现这个选题的？当时的报道背景是什么？',
            'T: 你在项目中承担什么角色？是独立还是协作？',
            'A: 你做了哪些调研和采访？对接了多少人/机构？有没有出差实地走访？',
            'R: 成稿的传播效果如何？阅读量、点赞、评论大概多少？在平台排名怎样？',
          ],
        },
        'intern-2': {
          guidance_text: '补充真实故事计划：报道主题、如何找到采访对象、成稿字数与传播数据（STAR：背景→任务→行动→结果）',
          star_hints: [
            'S: 这篇报道的选题背景是什么？为什么值得关注？',
            'T: 你承担了哪些具体工作（采访、写作、编辑）？',
            'A: 联系采访对象遇到了什么困难？你是怎么克服的？',
            'R: 成稿的阅读量、转发量是多少？是否引发公共讨论？',
          ],
        },
        'intern-3': {
          guidance_text: '补充网易看客：几篇稿、选题与采访流程、阅读点赞与复盘方法（STAR：背景→任务→行动→结果）',
          star_hints: [
            'S: 当时栏目的定位和内容方向是什么？',
            'T: 你负责选题申报、采访还是全流程？',
            'A: 选题前做了哪些调研？怎么联系到的采访对象？',
            'R: 稿件的阅读量、点赞是多少？在同期内容中排名如何？',
          ],
        },
        'intern-4': {
          guidance_text: '补充财经大健康短视频：日均条数、选题到剪辑流程、累计产出与互动（STAR：背景→任务→行动→结果）',
          star_hints: [
            'S: 栏目主要覆盖什么领域的资讯？',
            'T: 你负责哪些环节？选题、文案还是剪辑？',
            'A: 每天的工作流程是怎样的？用了什么工具？',
            'R: 累计产出了多少条视频？平均互动量是多少？',
          ],
        },
        'project-1': {
          guidance_text: '补充微见主编：接手时订阅与阅读、你做的改变、爆款与数据涨幅（STAR：背景→任务→行动→结果）',
          star_hints: [
            'S: 接手时公众号的状态（粉丝数、阅读量）是怎样的？',
            'T: 你作为主编主要负责什么？团队多大？',
            'A: 你做了哪些关键改变（内容策略、工作流程、团队管理）？',
            'R: 任期内阅读量、粉丝等数据有什么变化？有没有爆款内容？',
          ],
        },
      };
      const fallback = {
        guidance_text: '用 STAR 简述这段经历：背景、你的任务、具体行动、可量化结果',
        star_hints: [
          'S: 当时的背景和挑战是什么？',
          'T: 你在其中承担了什么角色和任务？',
          'A: 你具体采取了哪些行动？',
          'R: 最终取得了什么成果？有没有可量化的数据？',
        ],
      };
      return response(guidanceMap[sectionId] || fallback);
    },
  },

  jobTargetApi: {
    create: () => response({ success: true }),
  },

  analysisApi: {
    trigger: () => response({ success: true }),
    triggerStream: async (
      _sessionId: string,
      callbacks: { onProgress?: (message: string) => void; onDone?: () => void }
    ) => {
      callbacks.onProgress?.('正在解析岗位JD：企业微信AI生态...');
      await wait(400);
      callbacks.onProgress?.('正在分析简历与岗位匹配度...');
      await wait(500);
      callbacks.onProgress?.('正在评估经历可迁移性与改写潜力...');
      await wait(400);
      callbacks.onProgress?.('正在生成能力差距分析...');
      await wait(300);
      callbacks.onDone?.();
    },
    get: () => response(mockAnalysis),
    tuneForJob: () => response({ success: true }),
  },

  voiceApi: {
    input: async (sectionId: string) => {
      await wait(1200);
      const transcripts: Record<string, string> = {
        'intern-1': '我之前在南方周末实习了半年，主要做特稿。做了一个关于北京飞絮治理的深度报道，对接了园林绿化局和中国林业大学等好几个政府部门和科研机构。那篇稿子叫《毛白杨生、毛白杨死》，后来阅读量十万加了，点赞1479。除了这个选题我还做了广州限购政策松绑后的市场调研，走访了30多个房产中介和销售经理。还做了一个零工经济的选题，访谈了20多位兼职咖啡师。另外我还自己发起了一个跨媒体的读稿会社群，邀请了8位资深记者分享，建起了一个50多人的行业交流社群。',
        'intern-2': '我在真实故事计划实习了四个月，主要做深度报道采写。最主要的成果是独立完成了被拐儿童解清帅回归原生家庭一年后的深度报道，大概7000字。这是第一篇关注解清帅回归后心理和身份认同问题的深度稿件，阅读量超过10万，点赞657，转发1628。为了联系到采访对象，我通过多方信息检索找到了他父亲的联系方式。',
        'intern-3': '我在网易文创看客栏目做了三个月内容运营实习生。独立完成了4篇非虚构稿件，其中"断粮动物园"和"技校老师自白"阅读量分别达到6.1万和9.6万。选题前我会在微博小红书做热点分析和用户评论分析。为了断粮动物园那篇稿件还出差去大连瓦房店做面对面采访。我还负责每周的内容数据复盘，总结了一套标题优化的SOP。',
        'intern-4': '在财经大健康栏目做了一个月视频实习生，主要负责大健康行业的短视频资讯制作。每天产出1到2条1-2分钟的短视频，累计完成了20多条。从选题申报、文案撰写到视频剪辑全链路操作。',
      };
      return response({ transcript: transcripts[sectionId] || '模拟语音转写结果：这段经历的详细描述...' });
    },
    transcribe: () => response({ transcript: '模拟语音转写结果' }),
    transcribeByUrl: () => response({ transcript: '模拟语音转写结果' }),
    summarize: (_transcript: string, sectionId: string) => {
      if (sectionId.startsWith('edu')) {
        return response({
          transcript: _transcript,
          summary: { cleaned_transcript: _transcript },
          draft_resume_content: '',
          should_followup: false,
          confidence_score: 88,
          information_gaps: [],
          questions: [],
          followup_count: 0,
          max_followups: 4,
          reason: '教育经历信息充分',
          education_course_prompt: '你是传播学/新闻学背景，建议补充与AI产品岗位最相关的课程——如"人工智能与编程在新闻传播中的运用""数字媒体营销策略"，并强调课程中涉及的数据分析、产品思维等内容。',
        });
      }

      if (sectionId === 'intern-1') {
        return response({
          transcript: _transcript,
          summary: {
            cleaned_transcript: _transcript,
            company: '南方周末',
            position: '特稿工作室实习生',
            duration: '2023.12-2024.06',
            responsibilities: ['深度选题全流程操作', '资料搜集与采访对象挖掘', '深度访谈与成稿'],
            achievements: ['成稿《毛白杨生，毛白杨死》阅读量10万+', '点赞量1479'],
            keywords_preserved: ['深度调研', '资源整合', '政策分析'],
            transferable_skills: ['快速调研陌生行业', '多方资源整合', '信息结构化输出'],
            potential_packaging_points: ['调研方法论可迁移到商业分析', '多方沟通能力匹配跨部门协作需求'],
          },
          draft_resume_content: '',
          should_followup: true,
          confidence_score: 55,
          information_gaps: [
            { dimension: '量化指标', description: '具体对接了多少家机构？传播效果的排名或互动数据？', severity: 'critical' as const },
            { dimension: '项目广度', description: '除了"毛白杨"选题，在南方周末期间是否有其他项目？', severity: 'important' as const },
            { dimension: '方法论', description: '调研和采访的具体方法论是什么？如何快速切入陌生领域？', severity: 'important' as const },
            { dimension: '额外贡献', description: '是否有参与内部流程建设、社群运营或知识沉淀的工作？', severity: 'minor' as const },
          ],
          questions: [
            {
              id: 'q1',
              question: '在"毛白杨"选题中，你具体对接了多少家政府与科研机构？成稿发布后在平台上的排名和互动数据（如评论数）大概是多少？',
              type: 'choice' as const,
              options: ['对接5家以上，评论互动500+', '对接3-5家，评论互动200-500', '对接1-3家，互动数据不确定', '其他（请补充）'],
              priority: 'high' as const,
              reason: '量化数据能大幅提升简历说服力，尤其是对产品岗HR',
            },
            {
              id: 'q2',
              question: '在南方周末实习期间，除了"毛白杨"这个深度选题，你还做过其他什么项目？比如是否有做过市场调研、社会经济类选题？',
              type: 'text' as const,
              priority: 'high' as const,
              reason: '更多项目经历可以展现经验的广度和适应性',
            },
            {
              id: 'q3',
              question: '你是如何快速切入"飞絮治理"这个陌生领域的？具体的调研步骤和方法论是什么？',
              type: 'choice' as const,
              options: ['先看政策文件，再找关键人物访谈', '先做桌面调研，再实地走访', '先找行业专家咨询，再扩展调研', '综合以上方法，有自己的调研SOP'],
              priority: 'medium' as const,
              reason: '方法论描述有助于将"新闻调研"包装为"行业研究/商业分析"能力',
            },
            {
              id: 'q4',
              question: '在南方周末期间，你是否参与过任何社群运营、内部知识管理、或跨团队协作的项目？',
              type: 'text' as const,
              priority: 'medium' as const,
              reason: '社群/社区相关经历可以直接对标JD中"开发者社区建设"的要求',
            },
          ],
          followup_count: 0,
          max_followups: 4,
          reason: '关键量化指标和项目广度信息缺失，需要补充以充分展现可迁移能力',
        });
      }

      return response({
        transcript: _transcript,
        summary: { cleaned_transcript: _transcript },
        draft_resume_content: '',
        should_followup: true,
        confidence_score: 60,
        information_gaps: [
          { dimension: '量化指标', description: '缺少可量化的结果数据', severity: 'important' as const },
        ],
        questions: [
          {
            id: 'q1',
            question: '这段经历中最值得展示的量化成果是什么？',
            type: 'text' as const,
            priority: 'high' as const,
            reason: '量化数据提升说服力',
          },
          {
            id: 'q2',
            question: '你在团队中承担了什么角色？独立负责还是协作参与？',
            type: 'choice' as const,
            options: ['独立负责整个项目', '主导核心模块', '协作参与，负责部分', '其他（请补充）'],
            priority: 'medium' as const,
            reason: '明确个人贡献度',
          },
        ],
        followup_count: 0,
        max_followups: 4,
        reason: '需要补充更多可量化的细节',
      });
    },
    askFollowup: () =>
      response({
        should_followup: false,
        confidence_score: 85,
        information_gaps: [],
        questions: [],
        followup_count: 0,
        max_followups: 4,
        reason: '',
        education_course_prompt: '你是传播学/新闻学背景，建议补充"人工智能与编程在新闻传播中的运用""数字媒体营销策略"等高分课程，突出与AI产品岗位的关联。',
      }),
    answerFollowup: (_sectionId: string, answers: Record<string, string>) =>
      response({
        success: true,
        should_followup: false,
        confidence_score: 92,
        information_gaps: [],
        questions: [],
        reason: '信息已充分，可以生成高质量改写',
        followup_count: 1,
        max_followups: 4,
        collected_info: {
          summary: {
            ...answers,
            institutions_count: answers.q1 || '对接5家以上',
            other_projects: answers.q2 || '广州限购政策调研、零工经济选题、跨媒体读稿会社群运营',
            research_methodology: answers.q3 || '综合以上方法，有自己的调研SOP',
            community_experience: answers.q4 || '独立发起跨媒体读稿会社群，50+人行业交流社群',
          },
        },
      }),
    streamTranscribe: {
      connect: () => ({
        sendAudio: () => undefined,
        sendEnd: () => undefined,
        close: () => undefined,
      }),
    },
  },

  rewriteApi: {
    rewrite: (sectionId: string, _originalContent: string) => {
      if (sectionId === 'intern-1') {
        return response({ ...NANFANG_REWRITE_RESULT, section_id: sectionId });
      }
      return response({
        rewritten_content: `[改写后] ${_originalContent}`,
        match_score: 65,
        key_highlights: ['补充了量化数据', '优化了表述结构'],
        exaggerations: [],
        overall_exaggeration_level: '无',
        proof_needed: [],
        content_decisions: { kept: ['核心经历'], condensed: [], removed: [] },
        ats_optimization: { keywords_included: [], keywords_missing: [], format_compliance: '基本合规' },
        reasoning_process: '基于岗位要求优化表述和结构。',
        section_id: sectionId,
      });
    },
  },

  planApi: {
    generate: () => response(mockPlanSummary),
    get: () => response(mockPlanSummary),
    getSummary: () => response(mockPlanSummary),
  },
};
