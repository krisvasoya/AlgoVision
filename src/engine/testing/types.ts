export interface UsabilityFinding {
  task: string;
  issue: string;
  severity: "critical" | "high" | "medium" | "low";
  evidence: string;
  proposedFix: string;
}

export type UsabilityEventType =
  | "page_opened"
  | "algorithm_selected"
  | "practice_started"
  | "practice_answer_submitted"
  | "hint_requested"
  | "tutor_action_requested"
  | "exam_started"
  | "exam_completed"
  | "mistake_reviewed"
  | "playground_run";

export interface UsabilityEvent {
  id: string;
  type: UsabilityEventType;
  details?: Record<string, unknown>;
  timestamp: number;
}

export interface DeveloperChecklist {
  firstTimeNavigation: boolean;
  algorithmDiscovery: boolean;
  visualizationUnderstanding: boolean;
  controlsDiscoverability: boolean;
  practiceClarity: boolean;
  hintUsefulness: boolean;
  tutorDiscoverability: boolean;
  examClarity: boolean;
  mistakeReview: boolean;
  mobileUsability: boolean;
}
