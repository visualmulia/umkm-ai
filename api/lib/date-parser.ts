/**
 * Parse natural language dates/times in Indonesian
 * Returns structured booking intent or null
 */

const DAY_NAMES = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];
const MONTH_NAMES = ["januari", "februari", "maret", "april", "mei", "juni", "juli", "agustus", "september", "oktober", "november", "desember"];

function parseDayOfWeek(text: string): number | null {
  const lower = text.toLowerCase();
  for (let i = 0; i < DAY_NAMES.length; i++) {
    if (lower.includes(DAY_NAMES[i])) return i;
  }
  return null;
}

function parseExplicitDate(text: string): Date | null {
  // Match patterns like: "28 Juni", "1 Juli 2025", "28/06/2025", "2025-06-28"
  const lower = text.toLowerCase();

  // Pattern: "28 Juni" or "28 Juni 2025"
  const monthWordMatch = lower.match(/(\d{1,2})\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)(?:\s+(\d{4}))?/);
  if (monthWordMatch) {
    const day = parseInt(monthWordMatch[1]);
    const month = MONTH_NAMES.indexOf(monthWordMatch[2]);
    const year = monthWordMatch[3] ? parseInt(monthWordMatch[3]) : new Date().getFullYear();
    return new Date(year, month, day);
  }

  // Pattern: "28/06" or "28/06/2025"
  const slashMatch = lower.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/);
  if (slashMatch) {
    const day = parseInt(slashMatch[1]);
    const month = parseInt(slashMatch[2]) - 1;
    const year = slashMatch[3] ? parseInt(slashMatch[3]) : new Date().getFullYear();
    return new Date(year, month, day);
  }

  return null;
}

function getRelativeDate(text: string): Date | null {
  const lower = text.toLowerCase();
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (lower.includes("hari ini") || lower.includes("harini")) {
    return new Date(now);
  }
  if (lower.includes("besok")) {
    return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
  if (lower.includes("lusa")) {
    return new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  }

  const dayOfWeek = parseDayOfWeek(text);
  if (dayOfWeek !== null) {
    // Find next occurrence of this day
    const currentDay = now.getDay();
    let daysUntil = dayOfWeek - currentDay;
    if (daysUntil <= 0) daysUntil += 7; // Next week if today or passed
    return new Date(now.getTime() + daysUntil * 24 * 60 * 60 * 1000);
  }

  return null;
}

function parseTime(text: string): { startTime: string; endTime: string | null } | null {
  const lower = text.toLowerCase();

  // Pattern: "dari jam 9 sampai jam 5 sore" or "jam 09.00 - 17.00"
  const rangeMatch = lower.match(/(?:dari\s+)?jam\s*(\d{1,2})[:\.]?(\d{2})?\s*(?:sampai|sd|s/d|[-–])\s*jam\s*(\d{1,2})[:\.]?(\d{2})?/);
  if (rangeMatch) {
    let startH = parseInt(rangeMatch[1]);
    const startM = rangeMatch[2] ? parseInt(rangeMatch[2]) : 0;
    let endH = parseInt(rangeMatch[3]);
    const endM = rangeMatch[4] ? parseInt(rangeMatch[4]) : 0;

    // Detect "sore"/"malam" for end time if not specified
    if (lower.includes("sore") || lower.includes("malam")) {
      if (endH < 12) endH += 12;
    }

    return {
      startTime: `${String(startH).padStart(2, "0")}:${String(startM).padStart(2, "0")}`,
      endTime: `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`,
    };
  }

  // Pattern: "jam 9 pagi" or "jam 3 sore" or "jam 14.00"
  const singleMatch = lower.match(/jam\s*(\d{1,2})[:\.]?(\d{2})?\s*(pagi|siang|sore|malam)?/);
  if (singleMatch) {
    let h = parseInt(singleMatch[1]);
    const m = singleMatch[2] ? parseInt(singleMatch[2]) : 0;
    const period = singleMatch[3];

    if (period === "sore" || period === "malam") {
      if (h < 12) h += 12;
    } else if (period === "pagi" || period === "siang") {
      // keep as is
    }

    return {
      startTime: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
      endTime: null,
    };
  }

  return null;
}

export function parseBookingIntent(text: string, defaultDurationMinutes = 60): {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
} | null {
  // 1. Parse date
  let date: Date | null = parseExplicitDate(text);
  if (!date) {
    date = getRelativeDate(text);
  }
  if (!date) return null;

  const dateStr = date.toISOString().split("T")[0];

  // 2. Parse time
  const timeParsed = parseTime(text);
  if (!timeParsed) return null;

  const startTime = timeParsed.startTime;
  let endTime = timeParsed.endTime;

  // If no end time, calculate from duration
  if (!endTime) {
    const [h, m] = startTime.split(":").map(Number);
    const endDate = new Date(2000, 0, 1, h, m);
    endDate.setMinutes(endDate.getMinutes() + defaultDurationMinutes);
    endTime = `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`;
  }

  return { date: dateStr, startTime, endTime };
}

export function formatDateId(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function addMinutesToTime(timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(2000, 0, 1, h, m);
  d.setMinutes(d.getMinutes() + minutes);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
