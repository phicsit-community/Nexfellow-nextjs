import { useNavigate, Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearUser } from "../slices/userSlice";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faEnvelope, faPaperPlane, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const handleLogout = () => {
    console.log("Logout clicked");

    dispatch(clearUser());
    localStorage.clear();

    navigate("/login");
  };

  const getActiveClass = (path) => location.pathname === path ? "text-text-gradient" : "text-gray-800";

  return (
    <nav className="bg-white p-4 md:p-3">
    {/* Mobile Navigation */}
    <div className="md:hidden container mx-auto grid grid-cols-4 gap-4 items-center">
    <Link
      to="/"
      className={`flex flex-col items-center ${getActiveClass('/')}`}
    >
      <FontAwesomeIcon 
        icon={faHome} 
        className={`text-xl ${location.pathname === '/' ? 'text-[#26B2B4]' : 'text-gray-800'} hover:text-gray-400`} 
      />
      <span className="text-xs">Home</span>
    </Link>

    <Link
      to="/send-email"
      className={`flex flex-col items-center ${getActiveClass('/sendEmail')}`}
    >
      <FontAwesomeIcon 
        icon={faPaperPlane} 
        className={`text-xl ${location.pathname === '/send-email' ? 'text-[#26B2B4]' : 'text-gray-800'} hover:text-gray-400`} 
      />
      <span className="text-xs">Send Email</span>
    </Link>

    <Link
      to="/view-emails"
      className={`flex flex-col items-center ${getActiveClass('/view-emails')}`}
    >
      <FontAwesomeIcon 
        icon={faEnvelope} 
        className={`text-xl ${location.pathname === '/viewEmails' ? 'text-[#26B2B4]' : 'text-gray-800'} hover:text-gray-400`} 
      />
      <span className="text-xs">View Emails</span>
    </Link>
    
    <div
      onClick={handleLogout}
      className={`flex flex-col items-center text-red-500 cursor-pointer hover:text-red-700`}
    >
      <FontAwesomeIcon 
        icon={faSignOutAlt} 
        className="text-xl" 
      />
      <span className="text-xs">Logout</span>
    </div>
    </div>
  
    {/* Desktop Navigation */}
    <div className="container mx-auto grid grid-cols-3 gap-4 items-center">
      <div className="hidden md:flex justify-start space-x-4 items-center">
        <Link
          to="/"
          className={`text-gray-800 hover:text-gray-400 ${location.pathname === '/' ? 'font-bold' : ''}`}
        >
          <FontAwesomeIcon icon={faHome} className="mr-2" />
          Home
        </Link>
        <Link
          to="/sendEmail"
          className={`text-gray-800 hover:text-gray-400 ${location.pathname === '/sendEmail' ? 'font-bold' : ''}`}
        >
          <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
          Send an Email
        </Link>
        <Link
          to="/viewEmails"
          className={`text-gray-800 hover:text-gray-400 ${location.pathname === '/viewEmails' ? 'font-bold' : ''}`}
        >
          <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
          View Emails
        </Link>
        <Link
          to="/contact"
          className={`text-gray-800 hover:text-gray-400 ${location.pathname === '/contacts' ? 'font-bold' : ''}`}
        >
          Contacts
        </Link>
      </div>
  
      {/* Center Title with #26B2B4 Color */}
      <div className="text-center text-xl font-bold hidden md:block" style={{ color: '#26B2B4' }}>
        {location.pathname === '/' && 'Home'}
        {location.pathname === '/viewEmails' && 'View Emails'}
        {location.pathname === '/sendEmail' && 'Send Email'}
        {location.pathname === '/contact' && 'Contacts'}
        {location.pathname.startsWith('/email/') && 'Email Details'}
      </div>
  
      {/* Logout Button in Red */}
      <div className="hidden md:flex justify-end items-center">
        <div
          onClick={handleLogout}
          className="text-red-500 cursor-pointer hover:text-red-700"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
          Logout
        </div>
      </div>
    </div>
  </nav>
  

  );
};

export default Navbar;
