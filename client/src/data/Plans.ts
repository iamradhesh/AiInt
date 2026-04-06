import type { Plan } from "../types/Plan";

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free Plan",
    price: "₹0",
    credits: 100,
    description: "Ideal for individuals looking to explore our AI interview assistant with limited usage.",
    features: [
      "100 AI Interview Credits per month",
      "Access to basic interview analysis",
      "Email support",
      "Limited History Tracking (last 5 interviews)"
    ],
    default: true
  },
  {
    id: "starter",
    name: "Starter Plan",
    price: "₹199",
    credits: 500,
    description: "Perfect for students and beginners preparing for interviews regularly.",
    features: [
      "500 AI Interview Credits per month",
      "Detailed interview analysis",
      "Priority email support",
      "History Tracking (last 20 interviews)"
    ]
  },
  {
    id: "pro",
    name: "Pro Plan",
    price: "₹499",
    credits: 1500,
    description: "Best for serious candidates aiming to crack top-tier interviews.",
    features: [
      "1500 AI Interview Credits per month",
      "Advanced AI feedback & suggestions",
      "Resume-based interview customization",
      "Chat support",
      "Full History Tracking"
    ]
  },
  {
    id: "premium",
    name: "Premium Plan",
    price: "₹999",
    credits: 4000,
    description: "For professionals who want intensive preparation and insights.",
    features: [
      "4000 AI Interview Credits per month",
      "Real-time AI coaching",
      "Behavioral + technical analysis",
      "Priority chat & email support",
      "Unlimited History Tracking"
    ],
    badge: "Most Popular"
  },
  {
    id: "elite",
    name: "Elite Plan",
    price: "₹1999",
    credits: 10000,
    description: "Designed for power users and job seekers targeting multiple companies.",
    features: [
      "10000 AI Interview Credits per month",
      "Company-specific interview simulations",
      "Personalized improvement roadmap",
      "Dedicated support",
      "Unlimited History & analytics"
    ],
    badge: "Best Value"
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    price: "₹4999",
    credits: 30000,
    description: "Ideal for institutions, coaching centers, and teams.",
    features: [
      "30000 AI Interview Credits per month",
      "Team dashboard & analytics",
      "Custom interview pipelines",
      "Dedicated account manager",
      "API access & integrations"
    ],
    badge: "For Teams"
  }
];