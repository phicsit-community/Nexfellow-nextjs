import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components'
import { useDispatch } from "react-redux";
import { clearUser } from "../slices/userSlice";

//icons
import { FiHome } from "react-icons/fi";
import { FaRegUserCircle } from "react-icons/fa";
import { PiPaperPlaneTiltBold } from "react-icons/pi";
import { MdOutlineEmail } from "react-icons/md";
import { MdOutlineContacts } from "react-icons/md";
import { MdOutlineLogout } from "react-icons/md";


const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 20%;
  max-width: 250px;
  min-width: 230px;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  background-color: #f9fff6;
  border-right: #d7efe8 2px solid;
  gap: 10px;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 20px;
`;

const Items = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  cursor: pointer;
  border-radius: 5px;
  transition: all 0.2s;
  background-color: ${({ active }) => (active ? '#b2e8a2' : 'transparent')}; 

  &:hover {
    background-color: #c0f1b0;
  }
`;

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Text = styled.p`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
`;

const Logout = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  gap: 10px;
  margin-top: 20px;
  color: #ff4f4f;
  cursor: pointer;
  padding: 10px;
  border-radius: 5px;
  transition: all 0.2s;
  background-color: ${({ hover }) => (hover ? '#ff1a1a' : 'transparent')}; /* New hover shade */

  &:hover {
    background-color: #ff3b3b; /* Darker shade for hover */
    color: #fff;
  }
`;

const Sidebar = () => {

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(clearUser());
    localStorage.clear();
    navigate("/login");
  };
  
  return (
    <Container>
      <LogoContainer 
        onClick={() => navigate('/')}
      >
        GeekMailer
      </LogoContainer>

      <Items
        active={location.pathname === '/'} 
        onClick={() => navigate('/')}
      >
        <IconContainer>
          <FiHome size={20}/>
        </IconContainer>
        <Text>Home</Text>
      </Items>
      
      <Items 
        active={location.pathname === '/list'} 
        onClick={() => navigate('/lists')}
      >
        <IconContainer>
          <FaRegUserCircle size={20}/>
        </IconContainer>
        <Text>Lists</Text>
      </Items>
      
      <Items
        active={location.pathname === '/send-email'} 
        onClick={() => navigate('/send-email')}
      >
        <IconContainer>
          <PiPaperPlaneTiltBold size={20}/>
        </IconContainer>
        <Text>Send Email</Text>
      </Items>

      <Items
        active={location.pathname === '/view-emails'} 
        onClick={() => navigate('/view-emails')}
      >
        <IconContainer>
          <MdOutlineEmail size={20}/>
        </IconContainer>
        <Text>View Emails</Text>
      </Items>

      <Items
        active={location.pathname === '/contact'} 
        onClick={() => navigate('/contact')}
      >
        <IconContainer>
          <MdOutlineContacts size={20}/>
        </IconContainer>
        <Text>Contacts</Text>
      </Items>

      <Logout
        onClick={handleLogout}
      >
        <IconContainer>
          <MdOutlineLogout size={20}/>
        </IconContainer>
        <Text>Logout</Text>
      </Logout>

    </Container>
  )
}

export default Sidebar;
