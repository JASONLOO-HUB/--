export interface Session {
  session_id: string;
  status: string;
  current_step?: CurrentStep;
}

export interface CurrentStep {
  module_type?: string;
  section_index?: number;
}

export interface Resume {
  id: string;
  session_id: string;
  file_url: string;
  raw_text: string;
  parsed_data: ParsedData;
}

/** 教育经历单条：学校、入学时间、毕业时间、学位、成绩 */
export interface EducationItem {
  school?: string;
  start_time?: string;
  end_time?: string;
  degree?: string;
  grades?: string;
}

/** 实习经历单条：公司、时间、职位、工作内容 */
export interface InternshipItem {
  company?: string;
  time?: string;
  position?: string;
  work_content?: string;
}

/** 项目经历单条：项目名称、时间、个人职责、项目内容 */
export interface ProjectItem {
  project_name?: string;
  time?: string;
  responsibility?: string;
  project_content?: string;
}

export interface ParsedData {
  education: EducationItem[];
  internship: InternshipItem[];
  project: ProjectItem[];
  skill: string[];
  personal_info?: Record<string, unknown>;
}

export interface JobTarget {
  id: string;
  session_id: string;
  job_title: string;
  jd_text: string;
  jd_analysis?: JDAnalysisResult;
}

export interface JDAnalysisResult {
  job_titles: string[];
  job_title?: string;
  explicit_requirements: Array<{ requirement: string; generalizable_description: string }> | string[];
  implicit_requirements: Array<{ requirement: string; liberal_arts_mapping: string; example_scenarios: string[] }> | string[];
  key_skills: string[];
  responsibilities: string[];
  skill_generalization_mapping?: Array<{ skill: string; generalized_description: string; liberal_arts_equivalents: string[] }>;
  common_requirements?: CommonRequirements;
  per_job_differentials?: Record<string, DifferentialRequirement>;
  recommended_focus?: string[];
}

/** 两评分一评级：经历匹配度、改写潜力（整十）、预计改写后匹配度、实现难度 */
export interface DimensionalAnalysisV2 {
  experience_match: { score: number; evidence?: string[]; gaps?: string[]; strict_comment?: string };
  rewrite_potential: { score: number; evidence?: string[]; strict_comment?: string };
  expected_match_after_rewrite: number;
  implementation_difficulty: 'high' | 'medium' | 'low';
  gaps?: string[];
}

export interface AnalysisResult {
  id: string;
  job_title: string;
  overall_score?: number | null;
  ability_gaps: AbilityGap[];
  strengths: string[];
  recommendations: string[];
  jd_text?: string;
  jd_analysis?: JDAnalysisResult;
  dimensional_analysis?: DimensionalAnalysisV2 | Record<string, unknown>;
  classification_result?: ResumeClassificationResult;
}

export interface AbilityGap {
  ability: string;
  gap: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ResumeSection {
  id: string;
  resume_id: string;
  module_type: string;
  original_content: string;
  rewritten_content: string | null;
  match_score: number | null;
  classification?: 'match' | 'needs_refinement' | 'missing';
  collected_info?: Record<string, unknown>;
  conversation_history?: ConversationMessage[];
  status: 'pending' | 'collecting' | 'rewritten' | 'confirmed';
  followup_count: number;
  voice_input_used: boolean;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type?: string;
  question_id?: string;
}

export interface ModuleInfo {
  type: string;
  count: number;
  has_content: boolean;
}

export interface VoiceTranscribeResponse {
  transcript: string;
  summary: Record<string, unknown> | null;
  questions: Question[] | null;
  confidence_score?: number;
  should_followup?: boolean;
  information_gaps?: InformationGap[];
}

export interface Question {
  id: string;
  question: string;
  type: 'text' | 'choice';
  options?: string[];
  priority?: 'high' | 'medium' | 'low';
  reason?: string;
}

export interface InformationGap {
  dimension: string;
  description: string;
  severity: 'critical' | 'important' | 'minor';
}

export interface TimelineItem {
  month: string;
  tasks: string[];
  focus?: string;
  internship_suggestions?: string[];
  project_suggestions?: string[];
  skill_practice?: string[];
}

export interface MultiJDAnalysisResult {
  id: string;
  session_id: string;
  common_requirements: CommonRequirements;
  differential_requirements: Record<string, DifferentialRequirement>;
  recommended_focus: string[];
}

export interface CommonRequirements {
  skills: string[];
  responsibilities: string[];
  keywords: string[];
}

export interface DifferentialRequirement {
  job_title?: string;
  unique_requirements?: string[];
  unique_skills: string[];
  unique_keywords?: string[];
  focus_areas: string[];
}

export interface ResumeClassificationResult {
  sections: SectionClassification[];
  overall_match_score: number;
  ability_gaps: AbilityGap[];
}

export interface SectionClassification {
  module_type: string;
  original_content: string;
  category: 'match' | 'needs_refinement' | 'missing';
  match_score: number;
  suggestions?: string;
}

export interface JobTuningResult {
  job_title: string;
  tuned_sections: TunedSection[];
  overall_match_score: number;
  additional_suggestions: string[];
}

export interface TunedSection {
  original_id: string;
  tuned_content: string;
  changes: string[];
  match_score_improvement: number;
}

export interface CareerPlan {
  timeline: TimelineItem[];
  recommendations: string[];
  milestones: Milestone[];
  urgency_assessment?: string;
  planning_mode?: string;
  judgement_basis?: string;
  fallback_timeline_after_autumn?: Array<Record<string, unknown>>;
  spring_recruit_strategy?: string[];
  social_recruit_insurance?: string[];
  resource_links?: ResourceLink[];
  checkpoints?: Checkpoint[];
  interview_preparation?: InterviewPreparation[];
  pitfalls?: Pitfall[];
  priority_guide?: string;
  priority_rationale?: string;
}

export interface Milestone {
  date: string;
  milestone: string;
  /** 实习类节点点击展开实习建议，项目类展开项目建议 */
  type?: 'internship' | 'project';
  internship_suggestions?: string[];
  project_suggestions?: string[];
}

export interface ResourceLink {
  task: string;
  resources: string[];
}

export interface Checkpoint {
  month: string;
  checklist: string[];
}

export interface InterviewPreparation {
  topic: string;
  suggested_response: string;
  supplement?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface Pitfall {
  risk: string;
  why: string;
  mitigation: string;
}

export interface FollowupResponse {
  should_followup: boolean;
  confidence_score: number;
  information_gaps: InformationGap[];
  questions: Question[];
  reason: string;
  followup_count: number;
  max_followups: number;
  collected_info?: Record<string, unknown>;
}

export interface RewriteResponse {
  rewritten_content: string;
  match_score: number;
  key_highlights: string[];
  suggestions?: string;
  exaggerations?: Array<Record<string, unknown>>;
  overall_exaggeration_level?: string;
  proof_needed?: string[];
  content_decisions?: Record<string, unknown>;
  ats_optimization?: Record<string, unknown>;
  reasoning_process?: string;
  section_id: string;
}
