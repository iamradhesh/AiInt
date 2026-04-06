import React, { useState } from "react";
import type { Plan } from "../types/Plan";
import { Check } from "lucide-react";
import axios from "axios";
import { ServerUrl } from "../App";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  theme?: {
    color?: string;
  };
}

interface PriceCardProps {
  plan: Plan;
  isSelected: boolean;
}
interface CreateOrderResponse {
  id: string;
  amount: number;
  currency: string;
}

const PriceCard = ({ plan, isSelected }: PriceCardProps) => {
  const [loadingPlan, setLoadingPlan] = useState<null | string>(null);
  const isFree = plan.default;

 const getAmountFromPrice = (price: string): number => {
  const numeric = price.replace(/[^\d]/g, "");
  const amount = Number(numeric);

  if (isNaN(amount)) {
    throw new Error(`Invalid price format: ${price}`);
  }

  return amount;
};

const handlePayment = async (selectedPlan: Plan): Promise<void> => {
  if (selectedPlan.default) return;

  setLoadingPlan(selectedPlan.id);

  try {
    const amount = getAmountFromPrice(selectedPlan.price);

    const res = await axios.post<CreateOrderResponse>(
      `${ServerUrl}/api/payment/order`,
      {
        planId: selectedPlan.id,
        amount,
        credits: selectedPlan.credits,
      },
      {
        withCredentials: true,
      }
    );

    const data = res.data;
    console.log(res.data);
    const options: RazorpayOptions = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID as string,
      amount: data.amount,
      currency: data.currency,
      name: "AiInt Pro",
      description: `Upgrade to ${selectedPlan.name} Plan - ${selectedPlan.credits} credits`,
      order_id: data.id,
      handler: async (response: RazorpayResponse) => {
        //console.log(response);

        // Optional: verify payment
        await axios.post(
          `${ServerUrl}/api/payment/verify`,
          response,
          { withCredentials: true }
        );
      },
      theme: {
        color: "#10b981",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open(); // ⚠️ YOU FORGOT THIS
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Payment Error:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
  } finally {
    setLoadingPlan(null);
  }
};
  return (
    <div className="flex flex-col h-full justify-between">
      {/* 🔥 Badge */}
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="text-xs font-semibold bg-emerald-600 text-white px-3 py-1 rounded-full shadow">
            {plan.badge}
          </span>
        </div>
      )}

      {/* 🧠 Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">{plan.name}</h2>

        <p className="text-gray-500 text-sm mt-2">{plan.description}</p>

        {/* 💰 Price */}
        <div className="mt-5 flex items-end gap-1">
          <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
          <span className="text-sm text-gray-500 mb-1">/month</span>
        </div>

        {/* ⚡ Credits */}
        <p className="text-emerald-600 font-medium mt-2 text-sm">
          {plan.credits} credits / month
        </p>
      </div>

      {/* 📋 Features */}
      <ul className="mt-6 space-y-3 flex-1">
        {plan.features.map((feature, index) => (
          <li
            key={index}
            className="flex items-start gap-2 text-sm text-gray-600"
          >
            <Check className="w-4 h-4 text-emerald-500 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* 🚀 CTA */}
      <button
        onClick={() => handlePayment(plan)}
        disabled={isFree || loadingPlan === plan.id}
        className={`
    mt-6 w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300
    
    ${
      isFree
        ? "bg-gray-200 text-gray-600 cursor-default"
        : isSelected
          ? "bg-emerald-700 text-white shadow-lg scale-[1.02]"
          : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg"
    }
  `}
      >
        {loadingPlan === plan.id
          ? "Processing..."
          : isFree
            ? "Current Plan"
            : isSelected
              ? "Proceed to Pay"
              : "Upgrade Plan"}
      </button>
    </div>
  );
};

export default PriceCard;
