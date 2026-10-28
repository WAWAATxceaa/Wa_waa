import { z } from "zod";
import { differenceInMinutes, differenceInCalendarDays } from "date-fns";

export const bookingSchema = z
  .object({
    roomId: z.string().min(1, "กรุณาเลือกห้องประชุม"),
    title: z.string().min(3, "หัวข้อการประชุมต้องมีอย่างน้อย 3 ตัวอักษร").max(150, "หัวข้อยาวเกินไป"),
    description: z.string().optional().nullable(),
    startTime: z.string().or(z.date()).transform((val) => new Date(val)),
    endTime: z.string().or(z.date()).transform((val) => new Date(val)),
    participantCount: z.coerce.number().min(1, "จำนวนผู้เข้าร่วมอย่างน้อย 1 คน"),
    participantsNote: z.string().optional().nullable(),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "เวลาเริ่มประชุมต้องมาก่อนเวลาสิ้นสุด",
    path: ["endTime"],
  })
  .refine(
    (data) => {
      const now = new Date();
      // Allow a small grace period of 2 minutes for clock drift
      const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
      return data.startTime >= twoMinutesAgo;
    },
    {
      message: "ไม่สามารถจองห้องประชุมย้อนหลังในอดีตได้",
      path: ["startTime"],
    }
  )
  .refine(
    (data) => {
      const durationInMinutes = differenceInMinutes(data.endTime, data.startTime);
      return durationInMinutes <= 240; // Max 4 hours (240 mins)
    },
    {
      message: "ระยะเวลาในการจองต้องไม่เกิน 4 ชั่วโมงต่อครั้ง",
      path: ["endTime"],
    }
  )
  .refine(
    (data) => {
      const daysInAdvance = differenceInCalendarDays(data.startTime, new Date());
      return daysInAdvance <= 60; // Max 60 days in advance
    },
    {
      message: "สามารถจองล่วงหน้าได้ไม่เกิน 60 วัน",
      path: ["startTime"],
    }
  );

export type BookingInput = z.infer<typeof bookingSchema>;
