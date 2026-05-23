import { format as formatDate, formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";

const numberFmt = new Intl.NumberFormat("he-IL");
const percentFmt = new Intl.NumberFormat("he-IL", {
  style: "percent",
  maximumFractionDigits: 1,
});
const currencyFmt = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  maximumFractionDigits: 0,
});

export const fmtNumber = (n: number) => numberFmt.format(n);
export const fmtPercent = (n: number) => percentFmt.format(n);
export const fmtCurrency = (n: number) => currencyFmt.format(n);

export const fmtDate = (d: Date | string, pattern = "d בMMM yyyy") =>
  formatDate(typeof d === "string" ? new Date(d) : d, pattern, { locale: he });

export const fmtTime = (d: Date | string) =>
  formatDate(typeof d === "string" ? new Date(d) : d, "HH:mm:ss", { locale: he });

export const fmtRelative = (d: Date | string) =>
  formatDistanceToNow(typeof d === "string" ? new Date(d) : d, {
    locale: he,
    addSuffix: true,
  });

export const fmtDuration = (minutes: number) => {
  if (minutes < 60) return `${Math.round(minutes)} ד'`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m === 0 ? `${h} ש'` : `${h} ש' ${m} ד'`;
};
