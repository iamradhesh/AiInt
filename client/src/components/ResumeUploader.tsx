import { FaFileUpload } from "react-icons/fa";

interface ResumeUploaderProps {
  resumeFile: File | null;
  onFileChange: (file: File) => void;
}

const ResumeUploader = ({ resumeFile, onFileChange }: ResumeUploaderProps) => (
  <div
    onClick={() => document.getElementById("resume-upload")?.click()}
    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer
               hover:border-green-500 hover:bg-green-50 transition duration-300"
  >
    <FaFileUpload className="text-4xl mx-auto text-green-400 mb-3" />
    <p className="text-gray-500 mb-4">Upload your resume for analysis</p>

    <input
      id="resume-upload"
      type="file"
      accept="application/pdf"
      className="hidden"
      onChange={(e) => e.target.files?.[0] && onFileChange(e.target.files[0])}
    />

    <span className="inline-block px-6 py-3 bg-green-500 text-white rounded-lg
                     hover:bg-green-600 transition duration-300">
      {resumeFile ? resumeFile.name : "Click to Upload Resume"}
    </span>
  </div>
);

export default ResumeUploader;