export interface LessonSection {
  id: string;
  lesson_id: string;
  section_type: string;
  title: string;
  content: string;
  estimated_minutes: number;
  order_index: number;
}

export interface ResearchSource {
  id: string;
  lesson_id: string;
  source_type: 'website' | 'book' | 'youtube';
  title: string;
  url: string;
  author_publisher?: string;
  snippet?: string;
  relevance_score: number;
  is_accessible: boolean;
  metadata_json?: string;
  retrieved_at: string;
}

export interface FactualIssue {
  issue_id: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affected_section: string;
  original_statement: string;
  explanation: string;
  supporting_evidence: string;
  recommended_correction: string;
  source_references: string[];
  confidence_level: string;
}

export interface FactualQCReport {
  audit_id: string;
  lesson_id: string;
  overall_status: 'PASS' | 'NEEDS IMPROVEMENT' | 'CRITICAL ISSUES';
  accuracy_score: number;
  evaluation_summary: string;
  issues_identified: FactualIssue[];
  verification_limitations: string;
  summary: string;
}

export interface InstructionalIssue {
  issue_id: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affected_section: string;
  original_content: string;
  explanation: string;
  recommended_improvement: string;
}

export interface InstructionalQCReport {
  audit_id: string;
  lesson_id: string;
  overall_status: 'PASS' | 'NEEDS IMPROVEMENT' | 'CRITICAL ISSUES';
  pedagogical_score: number;
  objective_alignment_assessment: string;
  clarity_assessment: string;
  structure_assessment: string;
  example_quality: string;
  activity_quality: string;
  assessment_quality: string;
  time_allocation_assessment: string;
  issues_identified: InstructionalIssue[];
  summary: string;
}

export interface QCRecommendation {
  id: string;
  lesson_id: string;
  qc_type: 'factual' | 'instructional';
  audit_id: string;
  section_name: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  issue_text: string;
  original_text?: string;
  recommended_fix: string;
  status: 'PENDING' | 'APPLIED' | 'REJECTED';
  created_at: string;
  updated_at: string;
}

export interface LessonDetail {
  id: string;
  title: string;
  learning_objective: string;
  target_level: string;
  difficulty: string;
  instructor_instructions?: string;
  estimated_duration_minutes: number;
  status: 'DRAFT' | 'IN_REVIEW' | 'COMPLETED';
  created_at: string;
  updated_at: string;
  sections: LessonSection[];
  sources: ResearchSource[];
}

export interface LessonListItem {
  id: string;
  title: string;
  learning_objective: string;
  target_level: string;
  difficulty: string;
  estimated_duration_minutes: number;
  status: string;
  created_at: string;
  updated_at: string;
  section_count: number;
  source_count: number;
  factual_qc_status?: string;
  instructional_qc_status?: string;
}

export interface DashboardStats {
  total_lessons: number;
  completed_lessons: number;
  in_review_lessons: number;
  draft_lessons: number;
  average_factual_score: number;
  average_pedagogical_score: number;
  recent_lessons: {
    id: string;
    title: string;
    learning_objective: string;
    status: string;
    estimated_duration_minutes: number;
    created_at: string;
  }[];
  recent_activities: {
    id: string;
    lesson_id: string;
    lesson_title: string;
    version_number: number;
    change_description: string;
    created_at: string;
  }[];
}

export interface CreateLessonPayload {
  title: string;
  learning_objective: string;
  target_level?: string;
  difficulty?: string;
  instructor_instructions?: string;
}

