import React from "react";
import InterviewStep1 from "../components/InterviewStep1";
import InterviewStep2 from "../components/InterviewStep2";
import InterviewStep3 from "../components/InterviewStep3";
import type { InterviewSetup, InterviewReport } from "../types/Interview";


const InterviewPage = () => {
  const [step, setStep] = React.useState<1 | 2 | 3>(1);

  const [setupData, setSetupData] = React.useState<InterviewSetup | null>(null);
  const [reportData, setReportData] = React.useState<InterviewReport | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      
      {step === 1 && (
        <InterviewStep1
          onStart={(data:InterviewSetup) => {
            setSetupData(data);
            setStep(2);
          }}
        />
      )}

      {step === 2 && setupData && (
        <InterviewStep2
          interviewData={setupData}
          onFinish={(report:InterviewReport) => {
            setReportData(report);
            setStep(3);
          }}
        />
      )}

      {step === 3 && reportData && (
        <InterviewStep3 report={reportData} />
      )}

    </div>
  );
};

export default InterviewPage;