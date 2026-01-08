// import React from "react";
// import Style from "./SVTable.module.css";
// import { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import Modal from "../ShowDetailsModal/Modal";
// const SVTable = () => {
//   const user = useSelector((state) => state.user.user);
//   const [emails, setEmails] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   //   const data = emails;
//   useEffect(() => {
//     const fetchEmails = async () => {
//       try {
//         const apiUrl = import.meta.env.VITE_API_URL;
//         const response = await fetch(`${apiUrl}/emails/admin/${user}`, {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           credentials: "include",
//         });
//         if (!response.ok) {
//           throw new Error("Network response was not ok");
//         }
//         const data = await response.json();
//         console.log("data in emails", data);
//         setEmails(data.emails);
//       } catch (error) {
//         console.error("Error fetching emails:", error);
//       }
//     };

//     fetchEmails();
//   }, [user]);

//   const viewUserDetail = (id) => {
//     console.log("Modal invoked");

//     setIsModalOpen(true); // Open the modal
//   };

//   const closeModal = () => {
//     setIsModalOpen(false); // Close the modal
//   };

//   return (
//     <div className={Style.maintable}>
//       <div className={Style.headtable}>
//         <div>
//           <h3>Subject</h3>
//         </div>
//         <div>
//           <h3>Status</h3>
//         </div>
//         <div>
//           {" "}
//           <h3>Schedule</h3>
//         </div>
//       </div>
//       <div className={Style.tablebody}>
//         {emails.map((item, key) => {
//           return (
//             <div
//               key={key}
//               className={Style.tablerow}
//               onClick={() => {
//                 viewUserDetail(item._id);
//               }}
//             >
//               <div>
//                 {" "}
//                 <h3 className={Style.text}>{item.subject}</h3>
//               </div>
//               <div>
//                 {" "}
//                 <h3 className={Style.text}> {item.status}</h3>
//               </div>
//               <div>
//                 {" "}
//                 <h3 className={Style.text}>{item.schedule}</h3>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//       {isModalOpen && (
//         <Modal onClose={closeModal}>
//           <h3>User Details for ID: {user}</h3>

//         </Modal>
//       )}
//     </div>
//   );
// };

// export default SVTable;

import React, { useEffect, useState } from "react";
import Style from "./SVTable.module.css";
import { useSelector } from "react-redux";
import Modal from "../ShowDetailsModal/Modal";

const SVTable = () => {
  const user = useSelector((state) => state.user.user);
  const [emails, setEmails] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // State to hold the selected user's details

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/emails/admin/${user}`, {
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
        console.log("data in emails", data);
        setEmails(data.emails); // Assuming the email data is stored in data.emails
      } catch (error) {
        console.error("Error fetching emails:", error);
      }
    };

    fetchEmails();
  }, [user]);

  // Function to handle view user detail
  const viewUserDetail = (id) => {
    console.log("Modal invoked");

    // Find the specific email or user based on the ID
    const selected = emails.find((email) => email._id === id);
    setSelectedUser(selected); // Set the selected user details in the state
    setIsModalOpen(true); // Open the modal
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
    setSelectedUser(null); // Reset the selected user when the modal is closed
  };

  return (
    <div className={Style.maintable}>
      <div className={Style.headtable}>
        <div>
          <h3>Subject</h3>
        </div>
        <div>
          <h3>Status</h3>
        </div>
        <div>
          <h3>Schedule</h3>
        </div>
      </div>
      <div className={Style.tablebody}>
        {emails.map((item, key) => {
          return (
            <div
              key={key}
              className={Style.tablerow}
              onClick={() => {
                viewUserDetail(item._id); // Pass the user ID to the function
              }}
            >
              <div>
                <h3 className={Style.text}>{item.subject}</h3>
              </div>
              <div>
                <h3 className={Style.text}>{item.status}</h3>
              </div>
              <div>
                <h3 className={Style.text}>{item.schedule}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Conditionally render the Modal */}
      {isModalOpen && selectedUser && (
        // <Modal onClose={closeModal}>
        //   <h3>User Details</h3>
        //   <p>
        //     <strong>Subject:</strong> {selectedUser.subject}
        //   </p>
        //   <p>
        //     <strong>Status:</strong> {selectedUser.status}
        //   </p>
        //   <p>
        //     <strong>Schedule:</strong> {selectedUser.schedule}
        //   </p>
        //   <p>
        //     <strong>To:</strong>
        //     <ul>
        //       {selectedUser.to.map((item, index) => (
        //         <>
        //           <li key={index}>{item}</li>
        //         </>
        //       ))}
        //     </ul>
        //   </p>
        //   {/* Add any other details you'd like to show */}
        // </Modal>

        <Modal onClose={closeModal}>
          <div className={Style.modalContainer}>
            <h3 className={Style.modalTitle}>User Details</h3>
            <div className={Style.modalContent}>
              <p className={Style.modalParagraph}>
                <strong className={Style.modalLabel}>Subject:</strong>{" "}
                {selectedUser.subject}
              </p>
              <p className={Style.modalParagraph}>
                <strong className={Style.modalLabel}>Status:</strong>{" "}
                {selectedUser.status}
              </p>
              <p className={Style.modalParagraph}>
                <strong className={Style.modalLabel}>Schedule:</strong>{" "}
                {selectedUser.schedule}
              </p>
              <p className={Style.modalParagraph}>
                <strong className={Style.modalLabel}>To:</strong>
                <ul className={Style.modalList}>
                  {selectedUser.to.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SVTable;
