// types/Plan.ts (recommended)
export interface Plan {
  id: string;
  name: string;
  price: string;
  credits: number;
  description: string;
  features: string[];
  default?: boolean;
  badge?: string;
}