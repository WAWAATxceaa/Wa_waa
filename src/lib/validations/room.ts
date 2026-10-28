import { z } from "zod";

export const roomSchema = z.object({
  name: z.string().min(2, "ชื่อห้องประชุมต้องมีอย่างน้อย 2 ตัวอักษร"),
  capacity: z.coerce.number().min(1, "ความจุต้องมีอย่างน้อย 1 ที่นั่ง").max(500, "ความจุไม่เกิน 500 ที่นั่ง"),
  floor: z.coerce.number().min(1, "กรุณาระบุชั้นที่ถูกต้อง"),
  description: z.string().optional().nullable(),
  amenities: z.array(z.string()).default([]),
  status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE"]).default("ACTIVE"),
  imageUrl: z.string().url("URL รูปภาพไม่ถูกต้อง").or(z.literal("")).optional().nullable(),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "รูปแบบรหัสสีไม่ถูกต้อง (เช่น #3b82f6)").default("#3b82f6"),
});

export type RoomInput = z.infer<typeof roomSchema>;
