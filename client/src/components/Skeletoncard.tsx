import React from "react";

const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
    {/* accent bar */}
    <div className="h-1 bg-gray-100 w-full" />

    <div className="p-5 flex flex-col gap-4">
      {/* header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-4 bg-gray-100 rounded-full w-3/4" />
          <div className="h-3 bg-gray-100 rounded-full w-1/2" />
        </div>
        <div className="h-6 w-20 bg-gray-100 rounded-full" />
      </div>

      {/* divider */}
      <div className="h-px bg-gray-50" />

      {/* score row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 bg-gray-100 rounded-2xl" />
          <div className="flex flex-col gap-1.5">
            <div className="h-3.5 bg-gray-100 rounded-full w-16" />
            <div className="h-5 bg-gray-100 rounded-full w-14" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5 items-end">
          <div className="h-3 bg-gray-100 rounded-full w-20" />
          <div className="h-3 bg-gray-100 rounded-full w-12" />
        </div>
      </div>

      {/* progress bar */}
      <div className="h-1.5 bg-gray-100 rounded-full w-full" />
    </div>
  </div>
);

export default SkeletonCard;