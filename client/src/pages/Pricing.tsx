import React, { useState } from "react";

import { motion as Motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { plans } from "../data/Plans";
import PriceCard from "../components/PriceCard";

const Pricing = () => {
 

  const [selectedPlan, setSelectedPlan] = React.useState<string>("free");
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-emerald-50 py-16 px-6">
      <div className="max-w-6xl mx-auto mb-14 flex items-start gap-4">
        <Motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          onClick={() => navigate("/")}
          className="mt-2 p-3 rounded-full bg-white shadow hover:shadow-md transition"
        >
          <FaArrowLeft className="text-gray-600" />
        </Motion.button>
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="text-center w-full"
        >
          <h1 className="text-4xl font-bold text-gray-800">Pricing Plans</h1>
          <p className="text-gray-500 mt-3 text-lg">
            Choose the plan that best fits your needs and start optimizing your
            interview process today!
          </p>
        </Motion.div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isDefault = plan.default;
          const isSelected = selectedPlan === plan.id;

          return (
            <Motion.div
              key={plan.id}
              whileHover={!isDefault ? { scale: 1.05 } : {}}
              onClick={() => {
                if (!isDefault) setSelectedPlan(plan.id);
              }}
              className={`
          relative rounded-3xl p-8 border transition-all duration-300
          
          ${
            isSelected
              ? "border-emerald-600 shadow-2xl bg-white scale-105"
              : "border-gray-200 bg-white/80"
          }

          ${!isDefault ? "cursor-pointer hover:bg-white/90" : "cursor-default"}
        `}
            >
              <PriceCard plan={plan} isSelected={isSelected} />
            </Motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Pricing;
