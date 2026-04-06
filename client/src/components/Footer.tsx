
import { BsRobot } from "react-icons/bs";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#f5f5f5] px-4 pt-16 pb-8">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-200 px-6 py-10">
        
        {/* Top Section */}
        <div className="flex flex-col md:flex-row md:justify-between gap-10">
          
          {/* Brand */}
          <div className="text-center md:text-left">
            <div className="flex justify-center md:justify-start items-center gap-3 mb-3">
              <div className="bg-black text-white p-2 rounded-lg">
                <BsRobot size={18} />
              </div>
              <h2 className="text-lg font-semibold">InterviewIQ.AI</h2>
            </div>

            <p className="text-gray-500 text-sm max-w-sm mx-auto md:mx-0">
              AI-powered platform to practice interviews, get instant feedback,
              and improve confidence for real-world success.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm text-gray-600 text-center md:text-left">
            
            <div>
              <h4 className="font-semibold mb-3 text-gray-800">Product</h4>
              <ul className="space-y-2">
                <li className="hover:text-black cursor-pointer">Features</li>
                <li className="hover:text-black cursor-pointer">Pricing</li>
                <li className="hover:text-black cursor-pointer">Modes</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-gray-800">Company</h4>
              <ul className="space-y-2">
                <li className="hover:text-black cursor-pointer">About</li>
                <li className="hover:text-black cursor-pointer">Careers</li>
                <li className="hover:text-black cursor-pointer">Contact</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-gray-800">Resources</h4>
              <ul className="space-y-2">
                <li className="hover:text-black cursor-pointer">Blog</li>
                <li className="hover:text-black cursor-pointer">Help Center</li>
                <li className="hover:text-black cursor-pointer">Privacy</li>
              </ul>
            </div>

          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          
          <p>© {new Date().getFullYear()} InterviewIQ.AI. All rights reserved.</p>

          {/* Social Icons */}
          <div className="flex items-center gap-4 text-lg">
            <FaGithub className="cursor-pointer hover:text-black transition" />
            <FaLinkedin className="cursor-pointer hover:text-black transition" />
            <FaTwitter className="cursor-pointer hover:text-black transition" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;