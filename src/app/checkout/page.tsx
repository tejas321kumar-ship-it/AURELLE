import { CheckoutClient } from "@/components/checkout-client";

export const metadata = {
  title: "Secure Checkout — AURELLE",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-5 py-12 md:px-10 md:py-16">
      <CheckoutClient />
    </div>
  );
}
