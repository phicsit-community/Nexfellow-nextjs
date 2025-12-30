// import { useState, useEffect } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
// import { faPlus } from "@fortawesome/free-solid-svg-icons";
// import SVTable from "../../Components/Table/SVTable";
// import Style from "./Contact.module.css";
// import { useNavigate } from "react-router-dom";
// const Contacts = () => {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const apiUrl = import.meta.env.VITE_API_URL;
//         const response = await fetch(`${apiUrl}/users/`, {
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
//         setUsers(data);
//       } catch (error) {
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUsers();
//   }, []);

//   const navigate = useNavigate();
//   const goback = () => {
//     console.log("button clicking");
//     navigate(-1);
//   };

//   if (loading) {
//     return <div className="text-center">Loading users...</div>;
//   }

//   if (error) {
//     return <div className="text-red-500 text-center">Error: {error}</div>;
//   }

//   return (
//     <div className={Style.container}>
//       <div onClick={goback} className={Style.back}>
//         <FontAwesomeIcon icon={faArrowLeft} />
//         <button>Back</button>
//       </div>
//       <div className={Style.heading}>
//         <h3 className={Style.interhead}>Contact</h3>
//         <div className={Style.addContact}>
//           <FontAwesomeIcon icon={faPlus} />
//           <button>Create Contact</button>
//         </div>
//       </div>
//       <div className={Style.Viewtable}>
//         <SVTable emails={users} />
//       </div>
//     </div>
//   );
// };

// export default Contacts;


import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPlus } from "@fortawesome/free-solid-svg-icons";
import CTable from "../../Components/Table/CTable";
import Detail from "../../Components/UserDetailModal/Detail";
import Style from "./Contact.module.css";
import { useNavigate } from "react-router-dom";

const Contacts = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/users/`, {
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
        setUsers(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const navigate = useNavigate();
  const goback = () => {
    console.log("button clicking");
    navigate(-1);
  };

  const handleCreateContact = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreate = (formData) => {
    // Handle the creation of a new contact
    console.log("New contact created:", formData);
    setIsModalOpen(false);
  };

  if (loading) {
    return <div className="text-center">Loading users...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">Error: {error}</div>;
  }

  return (
    <div className={Style.container}>
      <div onClick={goback} className={Style.back}>
        <FontAwesomeIcon icon={faArrowLeft} />
        <button>Back</button>
      </div>
      <div className={Style.heading}>
        <h3 className={Style.interhead}>Contact</h3>
        <div className={Style.addContact} onClick={handleCreateContact}>
          <FontAwesomeIcon icon={faPlus} />
          <button>Create Contact</button>
        </div>
      </div>
      <div className={Style.Viewtable}>
        <CTable/>
      </div>
      {isModalOpen && (
        <Detail onClose={handleCloseModal} onCreate={handleCreate} />
      )}
    </div>
  );
};

export default Contacts;