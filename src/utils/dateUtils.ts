const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

const THAI_DAYS = [
  'อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'
];

export function toBuddhistYear(gregorianYear: number): number {
  return gregorianYear + 543;
}

export function formatThaiDate(dateInput: string | Date, options?: { short?: boolean; includeDay?: boolean; includeYear?: boolean }): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '-';

  const dayName = THAI_DAYS[d.getDay()];
  const dateNum = d.getDate();
  const monthName = options?.short ? THAI_MONTHS_SHORT[d.getMonth()] : THAI_MONTHS_FULL[d.getMonth()];
  const year = toBuddhistYear(d.getFullYear());

  let result = `${dateNum} ${monthName}`;
  if (options?.includeYear !== false) {
    result += ` ${year}`;
  }
  if (options?.includeDay) {
    result = `วัน${dayName}ที่ ` + result;
  }
  return result;
}

export function formatThaiTime(timeStr: string): string {
  if (!timeStr) return '';
  return `${timeStr} น.`;
}

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeString(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function isTimeSlotConflicting(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  // startA < endB && endA > startB
  return startA < endB && endA > startB;
}
