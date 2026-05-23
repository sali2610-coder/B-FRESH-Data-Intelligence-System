import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  Sparkles,
  FileText,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "מרכז בקרה", href: "/", icon: LayoutDashboard },
  { label: "עובדים", href: "/employees", icon: Users },
  { label: "סניפים", href: "/branches", icon: Building2 },
  { label: "ניטור SLA", href: "/sla", icon: Clock },
  { label: "תובנות AI", href: "/insights", icon: Sparkles },
  { label: "טפסים", href: "/forms", icon: FileText },
];
