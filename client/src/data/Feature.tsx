import{
  FaUserTie,
  FaBriefcase,
  FaFileUpload,
  FaMicrophoneAlt,
  FaChartLine
} from 'react-icons/fa'

export const features = [
    {
        icon: <FaUserTie size={40} className='text-green-500 mb-4' />,
        text: "Choose Role & Experience Level"
    },
    // {
    //     icon: <FaBriefcase size={40} className='text-green-500 mb-4' />,
    //     text: "Select Industry & Company"
    // },
    // {
    //     icon: <FaFileUpload size={40} className='text-green-500 mb-4' />,
    //     text: "Upload Your Resume"
    // },
    {
        icon: <FaMicrophoneAlt size={40} className='text-green-500 mb-4' />,
        text: "Smart Voice Interview"
    },
    {
        icon: <FaChartLine size={40} className='text-green-500 mb-4' />,
        text: "Track Your Progress"
    }
]