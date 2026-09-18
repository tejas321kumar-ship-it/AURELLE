import { checkServiceability } from "@/lib/shiprocket";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const pincode = new URL(request.url).searchParams.get("pincode") ?? "";
  if (!/^\d{6}$/.test(pincode)) {
    return Response.json({ error: "Enter a valid 6-digit pincode." }, { status: 400 });
  }
  try {
    const result = await checkServiceability(pincode);
    return Response.json(result);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[serviceability] shiprocket check failed, falling back", error);
    }
    return Response.json({
      serviceable: true,
      live: false,
      couriers: 0,
      etaDays: "3-5",
      etd: null,
    });
  }
}
