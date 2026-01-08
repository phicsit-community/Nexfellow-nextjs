// import React from "react";
// import Style from "./SVTable.module.css";
// import { useEffect, useState } from "react";
// import { useSelector } from "react-redux";

// const Table = () => {
//   const user = useSelector((state) => state.user.user);
//   const [contacts, setContacts] = useState([]);

//   //   const data = contacts;
//   useEffect(() => {
//     const fetchContacts = async () => {
//       try {
//         const apiUrl = import.meta.env.VITE_API_URL;
//         const response = await fetch(
//           `${apiUrl}/contact-lists/contacts?adminId=${user}`,
//           {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             credentials: "include",
//           }
//         );
//         if (!response.ok) {
//           throw new Error("Network response was not ok");
//         }
//         const data = await response.json();
//         setContacts(data);
//       } catch (error) {
//         console.error("Error fetching contacts:", error);
//       }
//     };

//     fetchContacts();
//   }, [user]);

//   return (
//     <div className={Style.maintable}>
//       <div className={Style.headtable}>
//         <h3>Name</h3>
//         <h3>Usename</h3>
//         <h3>Email</h3>
//         <h3>Action</h3>
//       </div>
//       <div className={Style.tablebody}>
//         {contacts.map((item, key) => {
//           return (
//             <div key={key} className={Style.tablerow}>
//               <h3 className={Style.text}>{item.name}</h3>
//               <h3 className={Style.text}> {item.username}</h3>
//               <h3 className={Style.text}>{item.email}</h3>
//               <h3 className={Style.text}> Edit Delete</h3>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default Table;

import React from "react";
import Style from "./SVTable.module.css";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { MdAutoDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
const Table = () => {
  const user = useSelector((state) => state.user.user);
  const [contacts, setContacts] = useState([]);

  //   const data = contacts;
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(
          `${apiUrl}/contact-lists/contacts?adminId=${user}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();

        setContacts(data);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    fetchContacts();
  }, [user]);

  return (
    <div className={Style.maintable}>
      <div className={Style.headtable1}>
        <div>
          {" "}
          <h3>Name</h3>
        </div>
        <div>
          {" "}
          <h3>Username</h3>
        </div>
        <div>
          {" "}
          <h3>Email</h3>
        </div>
        <div>
          {" "}
          <h3>Action</h3>
        </div>
      </div>
      <div className={Style.tablebody}>
        {contacts.map((item, key) => {
          const emailPart = item.email.substring(0, 25);
          return (
            <div key={key} className={Style.tablerow1}>
              <div>
                {" "}
                <h3 className={Style.text}>{item.name}</h3>
              </div>
              <div>
                {" "}
                <h3 className={Style.text}> {item.username}</h3>
              </div>
              <div>
                {" "}
                <h3 className={Style.text}>{emailPart}...</h3>
              </div>
              <div className={Style.actionBtn}>
                <h3 className={Style.text}>
                  <MdAutoDelete size={27} />
                </h3>
                <h3 className={Style.text}>
                  <FaEdit size={25} />
                </h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Table;
