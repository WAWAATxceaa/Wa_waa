import crypto from "crypto";

/**
 * สร้าง Booking Code รูปแบบ BK-YYMM-XXXX เช่น BK-2610-8A7B
 */
export function generateBookingCode(): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, "0");
  const randomChars = crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase()
    .slice(0, 4);

  return `BK-${yy}${mm}-${randomChars}`;
}

/**
 * สร้าง Manage Token สำหรับสิทธิ์แก้ไข/ยกเลิก (Secure UUID)
 */
export function generateManageToken(): string {
  return crypto.randomUUID();
}
