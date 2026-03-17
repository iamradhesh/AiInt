import { FaUserAstronaut } from "react-icons/fa";
import { BsRobot } from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";
import { BsCoin } from "react-icons/bs";
import { hrImg, techImg, confidenceImg, creditImg } from "../assets";

export const modes = [
    {
        img: hrImg,
        title: "HR Interview Mode",
        description: "Behavioral and Situational Questions",
        icon: <FaUserAstronaut />,
    },
    {
        img: techImg,
        title: "Technical Interview Mode",
        description: "Coding and Problem Solving",
        icon: <BsRobot />,
    },
    {
        img: confidenceImg,
        title: "Behavioral Interview Mode",
        description: "Tone and voice analysis insights",
        icon: <HiSparkles />,
    },
    {
        img: creditImg,
        title: "Credits System",
        description: "Unlock Premium Features",
        icon: <BsCoin />,
    },
];