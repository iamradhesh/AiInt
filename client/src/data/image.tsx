import { BsBarChart, BsFileEarmarkText } from "react-icons/bs";
import { analyticsImg, evalImg, pdfImg, resumeImg } from "../assets";

export const imagesData = [
    {
        image: evalImg,
        icon: <BsBarChart size={26} />,
        title:"AI Answer Evaluation",
        description:"Get detailed feedback on your interview answers, including strengths, weaknesses, and suggestions for improvement.",
    },
    {
        image: resumeImg,
        icon: <BsFileEarmarkText size={26} />,
        title:" Resume Based Interviewing",
        description:"Upload your resume and practice answering interview questions tailored to your experience and skills.",
    },
    {
        image: pdfImg,
        icon: <BsFileEarmarkText size={26} />,
        title:"PDF Report Generation",
        description:"Receive comprehensive PDF reports summarizing your interview performance, feedback, and progress over time.",
    },

    {
        image: analyticsImg,
        icon: <BsBarChart size={26} />,
        title:"Performance Analytics",
        description:"Track your interview performance with detailed analytics and insights to identify areas for improvement.",
    }
]