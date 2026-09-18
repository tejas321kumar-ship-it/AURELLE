export const SHIPROCKET_BASE =
  process.env.SHIPROCKET_BASE_URL ?? "https://apiv2.shiprocket.in/v1/external";
export const SHIPROCKET_PICKUP_LOCATION =
  process.env.SHIPROCKET_PICKUP_LOCATION ?? "Primary";
export const SHIPROCKET_PICKUP_PINCODE =
  process.env.SHIPROCKET_PICKUP_PINCODE ?? "110001";

export const FREE_SHIPPING_THRESHOLD = 5000;
export const SHIPPING_FEE = 199;

export const razorpayConfigured = () =>
  Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

export const shiprocketConfigured = () =>
  Boolean(process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD);

export function generateOrderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.floor(Math.random() * 46656)
    .toString(36)
    .toUpperCase()
    .padStart(3, "0");
  return `AUR-${stamp}${rand}`;
}
