const THAI_MONTHS_FULL = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const THAI_MONTHS_SHORT = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

const THAI_DAYS_FULL = [
  "วันอาทิตย์",
  "วันจันทร์",
  "วันอังคาร",
  "วันพุธ",
  "วันพฤหัสบดี",
  "วันศุกร์",
  "วันเสาร์",
];

const THAI_DAYS_SHORT = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

/**
 * แปลงปี ค.ศ. เป็น พ.ศ. (+543)
 */
export function toBuddhistYear(dateOrYear: Date | number | string): number {
  if (typeof dateOrYear === "number") {
    return dateOrYear > 2400 ? dateOrYear : dateOrYear + 543;
  }
  const d = new Date(dateOrYear);
  return d.getFullYear() + 543;
}

/**
 * ฟอร์แมตวันที่แบบไทย
 * - short: 28 ต.ค. 2569
 * - medium: วันพุธที่ 28 ตุลาคม 2569
 * - full: วันพุธที่ 28 ตุลาคม พ.ศ. 2569
 */
export function formatThaiDate(
  dateInput: Date | string,
  mode: "short" | "medium" | "full" = "short"
): string {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";

  const day = d.getDate();
  const monthIdx = d.getMonth();
  const yearBE = toBuddhistYear(d);
  const dayOfWeekIdx = d.getDay();

  if (mode === "short") {
    return `${day} ${THAI_MONTHS_SHORT[monthIdx]} ${yearBE}`;
  }
  if (mode === "medium") {
    return `${THAI_DAYS_FULL[dayOfWeekIdx]}ที่ ${day} ${THAI_MONTHS_FULL[monthIdx]} ${yearBE}`;
  }
  return `${THAI_DAYS_FULL[dayOfWeekIdx]}ที่ ${day} ${THAI_MONTHS_FULL[monthIdx]} พ.ศ. ${yearBE}`;
}

/**
 * ฟอร์แมตเวลาไทย เช่น 09:30 น.
 */
export function formatThaiTime(dateInput: Date | string): string {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";

  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes} น.`;
}

/**
 * ฟอร์แมตวันและเวลาไทย เช่น 28 ต.ค. 2569 เวลา 09:30 - 11:30 น.
 */
export function formatThaiDateTime(
  startInput: Date | string,
  endInput?: Date | string
): string {
  const startDateStr = formatThaiDate(startInput, "short");
  const startTimeStr = formatThaiTime(startInput);

  if (!endInput) {
    return `${startDateStr} ${startTimeStr}`;
  }

  const endTimeStr = formatThaiTime(endInput);
  return `${startDateStr} เวลา ${startTimeStr} - ${endTimeStr}`;
}

/**
 * ดึงชื่อวันในสัปดาห์
 */
export function getThaiDayName(dateInput: Date | string, short = false): string {
  const d = new Date(dateInput);
  const dayIdx = d.getDay();
  return short ? THAI_DAYS_SHORT[dayIdx] : THAI_DAYS_FULL[dayIdx];
}

/**
 * ดึงชื่อเดือนภาษาไทย
 */
export function getThaiMonthName(monthIndex: number, short = false): string {
  return short ? THAI_MONTHS_SHORT[monthIndex] : THAI_MONTHS_FULL[monthIndex];
}

/**
 * ตรวจสอบว่าเป็นวันนี้หรือไม่
 */
export function isTodayThai(dateInput: Date | string): boolean {
  const d = new Date(dateInput);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/**
 * สร้างรายการสล็อตเวลาสำหรับตารางปฏิทิน เช่น 08:00 ถึง 18:00 ละ 30 นาที
 */
export function generateTimeSlots(
  startHour = 8,
  endHour = 18,
  stepMinutes = 30
): string[] {
  const slots: string[] = [];
  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += stepMinutes) {
      if (h === endHour && m > 0) break;
      const hh = h.toString().padStart(2, "0");
      const mm = m.toString().padStart(2, "0");
      slots.push(`${hh}:${mm}`);
    }
  }
  return slots;
}
