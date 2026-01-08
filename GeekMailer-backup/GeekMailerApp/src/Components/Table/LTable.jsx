import React from "react";
import Style from "./SVTable.module.css";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { MdAutoDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
const Table = () => {
  useEffect(() => {}, []);

  const user = useSelector((state) => state.user.user);
  const [lists, setLists] = useState([]);

  //   const data = lists;
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(
          `${apiUrl}/contact-lists/all?adminId=${user}`,
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
        setLists(data);
      } catch (error) {
        console.error("Error fetching lists:", error);
      }
    };

    fetchEmails();
  }, [user]);

  // return (
  //   <div className={Style.maintable}>
  //     <div className={Style.headtable}>
  //       <h3>List</h3>
  //       <h3>Total Contacts</h3>
  //       <h3>Creation Date</h3>
  //       <h3>Action</h3>
  //     </div>
  //     <div className={Style.tablebody}>
  //       {lists.map((item, key) => {
  //         return (
  //           <div key={key} className={Style.tablerow}>
  //             <h3 className={Style.text}>{item.listName}</h3>
  //             <h3 className={Style.text}> {item.numberOfContacts}</h3>
  //             <h3 className={Style.text}>{item.createdAt}</h3>
  //             <h3 className={Style.text}> Edit Delete</h3>
  //           </div>
  //         );
  //       })}
  //     </div>
  //   </div>
  // );

  return (
    <div className={Style.maintable}>
      <div className={Style.headtable}>
        <div>
          <h3>List</h3>
        </div>
        <div>
          <h3>Total Contacts</h3>
        </div>
        <div>
          <h3>Creation Date</h3>
        </div>
        <div>
          <h3>Action</h3>
        </div>
      </div>
      <div className={Style.tablebody}>
        {lists.map((item, key) => {
          const date = item.createdAt.split("T")[0];

          return (
            <div key={key} className={Style.tablerow}>
              <div>
                <h3 className={Style.text}>{item.listName}</h3>
              </div>
              <div>
                <h3 className={Style.text}>{item.numberOfContacts}</h3>
              </div>
              <div>
                <h3 className={Style.text}>{date}</h3>
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
