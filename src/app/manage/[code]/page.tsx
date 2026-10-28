import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ManageBookingView } from "@/components/manage/ManageBookingView";

export const dynamic = "force-dynamic";

export default async function ManageBookingPage({
  params,
  searchParams,
}: {
  params: { code: string };
  searchParams: { token?: string; phone?: string };
}) {
  const booking = await prisma.booking.findUnique({
    where: { bookingCode: params.code },
    include: {
      room: true,
      equipments: {
        include: { equipment: true },
      },
    },
  });

  if (!booking) {
    notFound();
  }

  // Parse Date objects to plain ISO strings for client component
  const serializedBooking = {
    ...booking,
    startTime: booking.startTime.toISOString(),
    endTime: booking.endTime.toISOString(),
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
    cancelledAt: booking.cancelledAt ? booking.cancelledAt.toISOString() : null,
  };

  return (
    <div className="py-4">
      <ManageBookingView
        booking={serializedBooking}
        initialToken={searchParams.token || ""}
      />
    </div>
  );
}
