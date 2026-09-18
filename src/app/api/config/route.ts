import { razorpayConfigured, shiprocketConfigured } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    brand: "AURELLE",
    razorpay: razorpayConfigured(),
    shiprocket: shiprocketConfigured(),
    // Only the public key id is ever exposed to the browser. The secret stays server-side.
    keyId: razorpayConfigured() ? process.env.RAZORPAY_KEY_ID : null,
  });
}
