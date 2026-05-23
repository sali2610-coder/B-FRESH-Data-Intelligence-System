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
};
