export type TaskStatus = "open" | "in_progress" | "blocked" | "done";
export type SLAState = "ok" | "at_risk" | "breached";
export type Priority = "low" | "medium" | "high" | "critical";

export type Branch = {
  id: string;
  name: string;
  region: "north" | "center" | "south";
  manager: string;
};

export type Employee = {
  id: string;
  name: string;
  role: string;
  branchId: string;
  avatarColor: string;
};

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  slaState: SLAState;
  branchId: string;
  assigneeId: string;
  createdAt: string; // ISO
  dueAt: string; // ISO
  resolvedAt?: string; // ISO
  handlingMinutes?: number;
  mondayItemId: number;
};

export type SLAEvent = {
  id: string;
  taskId: string;
  occurredAt: string;
  responseMinutes: number;
  hour: number; // 0-23
  weekday: number; // 0-6
};

export type TimeSeriesPoint = {
  date: string; // ISO date
  value: number;
};

export type KpiSnapshot = {
  openTasks: number;
  slaBreaches: number;
  avgHandlingMinutes: number;
  completedToday: number;
  topBranch: { id: string; name: string; score: number };
  topEmployee: { id: string; name: string; score: number };
  trendOpenTasks: TimeSeriesPoint[];
};

export type EmployeePerformance = {
  employeeId: string;
  name: string;
  role: string;
  branchName: string;
  avatarColor: string;
  open: number;
  done: number;
  avgHandlingMinutes: number;
  slaScore: number; // 0-100
  trend: number; // -100..100
};

export type SLAAlert = {
  id: string;
  taskTitle: string;
  branchName: string;
  assigneeName: string;
  severity: "high" | "medium" | "low";
  minutesOverdue: number;
  occurredAt: string;
};

export type AIInsight = {
  id: string;
  kind: "positive" | "warning" | "info";
  title: string;
  detail: string;
  metric?: string;
  confidence?: number; // 0..1
  importance?: "high" | "medium" | "low";
  recommendation?: string;
};

export type BranchStatus = "excellent" | "stable" | "attention" | "critical";

export type BranchHealth = {
  branchId: string;
  branchName: string;
  region: Branch["region"];
  manager: string;
  score: number; // 0..100
  previousScore: number;
  trend: number; // -100..100, % change
  movement: number; // rank delta vs previous period
  status: BranchStatus;
  // Component contributions (each 0..100, weighted into score)
  components: {
    sla: number;
    complaints: number;
    inspection: number;
    maintenance: number;
    staffing: number;
    sentiment: number;
    aging: number;
  };
  alerts: {
    recurringIssue: boolean;
    slaRisk: boolean;
    inspectionOverdue: boolean;
    staffingShortage: boolean;
  };
};

export type ActivityKind =
  | "complaint_opened"
  | "complaint_closed"
  | "sla_breach"
  | "maintenance_call"
  | "technician_delay"
  | "branch_outage"
  | "marketing_launch"
  | "recruitment_spike"
  | "franchise_lead"
  | "inspection_completed";

export type ActivitySeverity = "critical" | "high" | "medium" | "low" | "info";

export type ActivityEvent = {
  id: string;
  kind: ActivityKind;
  severity: ActivitySeverity;
  title: string;
  detail?: string;
  branchId?: string;
  branchName?: string;
  ownerName?: string;
  occurredAt: string;
  action?: { label: string; href?: string };
};

export type BranchInspection = {
  id: string;
  date: string;
  score: number;
  findings: number;
  inspector: string;
};

export type BranchTimelineItem = {
  id: string;
  kind: ActivityKind | "inspection" | "note";
  title: string;
  detail?: string;
  occurredAt: string;
  severity?: ActivitySeverity;
};

export type BranchProfile = {
  branch: Branch;
  health: BranchHealth;
  manager: { name: string; phone?: string; email?: string };
  tickets: Task[];
  ticketTrend: TimeSeriesPoint[];
  slaTrend: TimeSeriesPoint[];
  complaintsByCategory: { category: string; count: number }[];
  maintenanceHistory: {
    id: string;
    title: string;
    supplier: string;
    occurredAt: string;
    resolvedAt?: string;
    cost?: number;
  }[];
  inspections: BranchInspection[];
  staffing: {
    headcount: number;
    target: number;
    openReqs: number;
    avgTenureMonths: number;
  };
  csat: { score: number; trend: TimeSeriesPoint[] };
  timeline: BranchTimelineItem[];
  recommendations: AIInsight[];
  similarBranches: BranchHealth[];
};

/**
 * Surface-friendly slice of the IntelligenceSnapshot.complaintMetrics.
 * The full structured metric lives in the snapshot; DashboardData carries
 * what the UI bands need.
 */
export type ComplaintMetricsView = {
  total: number;
  open: number;
  closed: number;
  blocked: number;
  inProgress: number;
  slaRisk: number;
  overdue: number;
  byOwner: {
    owner: string;
    total: number;
    open: number;
    overdue: number;
    slaScore: number;
    avgResolutionMinutes: number;
  }[];
  byStatus: { status: string; count: number }[];
  bySecondaryStatus: { status: string; count: number }[];
  trend30d: { date: string; count: number }[];
};

export type DashboardData = {
  kpis: KpiSnapshot;
  tasksOverTime: TimeSeriesPoint[];
  slaCompliance: TimeSeriesPoint[];
  statusDistribution: { status: TaskStatus; count: number }[];
  responseHeatmap: { weekday: number; hour: number; value: number }[];
  funnel: { stage: string; value: number }[];
  branchRanking: { branchId: string; name: string; score: number }[];
  recentTasks: Task[];
  branches: Branch[];
  employees: Employee[];
  employeePerformance: EmployeePerformance[];
  slaAlerts: SLAAlert[];
  insights: AIInsight[];
  branchHealth: BranchHealth[];
  activity: ActivityEvent[];
  networkScore: number;
  networkScoreTrend: number; // % vs previous period
  complaintMetrics?: ComplaintMetricsView;
};
