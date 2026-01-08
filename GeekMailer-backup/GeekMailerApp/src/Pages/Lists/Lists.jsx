// import { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import Style from "./Lists.module.css";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
// import { faPlus } from "@fortawesome/free-solid-svg-icons";
// import LTable from "../../Components/Table/LTable";
// import { useNavigate } from "react-router-dom";
// const Lists = () => {
//   const [emails, setEmails] = useState([]);
//   const { user } = useSelector((state) => state.user);

//   useEffect(() => {
//     const fetchEmails = async () => {
//       const apiUrl = import.meta.env.VITE_API_URL;

//       try {
//         const response = await fetch(`${apiUrl}/emails/admin/${user}`, {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           credentials: "include",
//         });

//         if (response.ok) {
//           const data = await response.json();
//           setEmails(data.emails);
//         } else {
//           console.error("Failed to fetch emails. Status:", response.status);
//         }
//       } catch (error) {
//         console.error("Failed to fetch emails:", error);
//       }
//     };

//     fetchEmails();
//   }, [user]);

//   const navigate = useNavigate();
//   const goback = () => {
//     console.log("button clicking");
//     navigate(-1);
//   };

//   return (
//     <div className={Style.container}>
//       <div onClick={goback} className={Style.back}>
//         <FontAwesomeIcon icon={faArrowLeft} />
//         <button>Back</button>
//       </div>
//       <div className={Style.heading}>
//         <h3 className={Style.interhead}>Lists</h3>
//         <div className={Style.addContact}>
//           <FontAwesomeIcon icon={faPlus} />
//           <button>Create List</button>
//         </div>
//       </div>
//       <div className={Style.Viewtable}>
//         <LTable emails={emails} />
//       </div>
//     </div>
//   );
// };

// export default Lists;

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPlus } from "@fortawesome/free-solid-svg-icons";
import Detail from "../../Components/UserDetailModal/Detail";
import LTable from "../../Components/Table/LTable";
import Style from "./Lists.module.css";
import { useNavigate } from "react-router-dom";

const Lists = () => { 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const navigate = useNavigate();

  const goback = () => {
    console.log("button clicking");
    navigate(-1);
  };

  const handleCreateList = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreate = (formData) => {
    // Handle the creation of a new list
    console.log("New list created:", formData);
    setIsModalOpen(false);
  };

  return (
    <div className={Style.container}>
      <div onClick={goback} className={Style.back}>
        <FontAwesomeIcon icon={faArrowLeft} />
        <button>Back</button>
      </div>
      <div className={Style.heading}>
        <h3 className={Style.interhead}>Lists</h3>
        <div className={Style.addContact} onClick={handleCreateList}>
          <FontAwesomeIcon icon={faPlus} />
          <button>Create List</button>
        </div>
      </div>
      <div className={Style.Viewtable}>
        <LTable />
      </div>
      {isModalOpen && (
        <Detail onClose={handleCloseModal} onCreate={handleCreate} />
      )}
    </div>
  );
};

export default Lists;
