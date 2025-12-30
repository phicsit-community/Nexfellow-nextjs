import Style from "./Home.module.css"; 
import CardContainer from "../../Components/Cards/CContainer";
import Card from "../../Components/Cards/Card"; 
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Home = () => {
  const user = useSelector((state) => state.user.user);
  const [data, setData] = useState([]);

  useEffect(() => {
        const fetchData = async () => {
          try {
            const apiUrl = import.meta.env.VITE_API_URL;
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

  return (
    <div className={Style.container}>
      <div className={Style.heading}>
        <h3 className={Style.interhead}>Home</h3>
      </div>
      <div className={Style.mainBox}>
        <CardContainer>
          <div className={Style.cc1}>
            <Card text={`Mails Sent`} count={data.mailsSent}/>
            <Card text={`Contacts Stored`} count={data.totalContacts}/>
          </div>
        </CardContainer>

        <CardContainer>
          <div className={Style.cc2}>
            <Card text={`Total Lists`} count={data.totalContactList}/>
            <Card text={`Active Email Jobs`} count={data.totalActiveScheduledMails}/>
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
