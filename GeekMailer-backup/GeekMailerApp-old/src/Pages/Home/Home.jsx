import Style from "./Home.module.css"; 
import CardContainer from "../../Components/Cards/CContainer";
import Card from "../../Components/Cards/Card"; 
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const user = useSelector((state) => state.user.user);
  const [data, setData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
        const fetchData = async () => {
          try {
            const apiUrl = import.meta.env.VITE_API_URL || 'https://geekmailer-backend.onrender.com/api';
            const response = await fetch(`${apiUrl}/home?adminId=${user}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            });
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            const data = await response.json(); 
            console.log(data);
            setData(data);
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        };
    
        fetchData();
      }, [user]);

  const goback = () => {
    navigate(-1);
  };

  const handleAddContact = () => {
    navigate('/contact');
  };

  return (
    <div className={Style.container}>
      <div onClick={goback} className={Style.back}>
        <FontAwesomeIcon icon={faArrowLeft} size="sm" />
        <span>Back</span>
      </div>
      <div className={Style.heading}>
        <h3 className={Style.interhead}>Home</h3>
        <button className={Style.addContact} onClick={handleAddContact}>
          <FontAwesomeIcon icon={faPlus} size="sm" />
          <span>Add contact</span>
        </button>
      </div>
      <div className={Style.mainBox}>
        <CardContainer title="Contacts">
          <div className={Style.cc1}>
            <Card text="Total contacts" count={data.totalContacts || 0}/>
            <Card text="New contacts over the last 30 days" count={data.newContacts || 0}/>
          </div>
        </CardContainer>

        <CardContainer title="Mails">
          <div className={Style.cc2}>
            <Card text="Total contacts" count={data.totalContacts || 0}/>
            <Card text="New contacts over the last 30 days" count={data.newContacts || 0}/>
          </div>
        </CardContainer>
      </div>
    </div>
  );
};

export default Home;

// import React, { useState } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faArrowLeft, faPlus } from "@fortawesome/free-solid-svg-icons";
// import Detail from "../../Components/UserDetailModal/Detail";
// import Style from "./Home.module.css";
// import { useNavigate } from "react-router-dom";

// const Home = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const navigate = useNavigate();

//   const goback = () => {
//     console.log("button clicking");
//     navigate(-1);
//   };

//   const handleAddContact = () => {
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//   };

//   const handleCreate = (formData) => {
//     // Handle the creation of a new contact
//     console.log("New contact created:", formData);
//     setIsModalOpen(false);
//   };

//   return (
//     <div className={Style.container}>
//       <div onClick={goback} className={Style.back}>
//         <FontAwesomeIcon icon={faArrowLeft} />
//         <button>Back</button>
//       </div>
//       <div className={Style.heading}>
//         <h3 className={Style.interhead}>Home</h3>
//         <div className={Style.addContact} onClick={handleAddContact}>
//           <FontAwesomeIcon icon={faPlus} />
//           <button>Add Contact</button>
//         </div>
//       </div>

//     </div>
//   );
// };

// export default Home;
