// import React, { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import { Link, useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { setUser } from "../../redux/userSlice";
// import axios from "axios";

// // styles
// import styles from "./Header.module.css";

// // assets
// import navbarlogo from "../../assets/NexFellowLogo.svg";

// // icons
// import { FaSearch } from "react-icons/fa";
// import { AiOutlineBell, AiFillBell } from "react-icons/ai";

// // components
// // import NotificationModal from '../Notification/NotificationModal';

// function Header() {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [Path, setPath] = useState();
//   const toggleModal = () => setIsModalOpen((prev) => !prev);
//   const user = useSelector((state) => state.user.user);

//   useEffect(() => {
//     const fetchUserData = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         // Get user ID from local storage
//         const userData = JSON.parse(localStorage.getItem("user"));
//         const userId = userData;
//         console.log("user", user);
//         console.log("userId", userId);
//         if (!userId) {
//           throw new Error("User ID is missing");
//         }

//         // Fetch user data with the userId
//         const response = await axios.get(`/user/profile`);
//         setUser(response.data);
//         console.log("User Data:", response.data);
//       } catch (err) {
//         setError("Failed to load user data: " + err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     setPath(location.pathname);
//     fetchUserData();
//   }, [location.pathname]);

//   console.log("PATH", Path);
//   const handleRedirect = () => {
//     if (user) {
//       navigate(`/dashboard/${user.id}`);
//     } else {
//       navigate("/dashboard");
//     }
//   };

//   return (
//     <div className={styles.header}>
//       <div className={styles.navbarLogo}>
//         <Link to="/">
//           <img
//             className={styles.navbarlogo}
//             src={navbarlogo}
//             alt="NexFellow logo"
//             onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
//           />
//         </Link>
//       </div>
//       <div className={styles.headRight}>
//         {Path === "/view-emails" || Path === "/contact" ? (
//           <div className={styles.searchContainer}>
//             <FaSearch className={styles.searchIcon} />
//             <input
//               type="text"
//               placeholder="Search"
//               className={styles.searchBar}
//             ></input>
//           </div>
//         ) : null}

//         <div className={styles.headRightRight}>
//           {Path === "/view-emails" || Path === "/contact" ? (
//             <div onClick={toggleModal} style={{ cursor: "pointer" }}>
//               {isModalOpen ? (
//                 <AiFillBell size={28} color="#24B2B4" />
//               ) : (
//                 <AiOutlineBell size={28} color="#000" />
//               )}
//             </div>
//           ) : null}
//           {isModalOpen && <NotificationModal closeModal={toggleModal} />}

//           {loading ? (
//             <p>Loading...</p>
//           ) : error ? (
//             <p className={styles.error}>{error}</p>
//           ) : (
//             user && (
//               <div
//                 className={styles.profileLink}
//                 onClick={handleRedirect}
//                 style={{ cursor: "pointer" }}
//               >
//                 <img
//                   className={styles.dp}
//                   src={user.profilePhoto || "https://via.placeholder.com/50"}
//                   alt={user.username || "User"}
//                   onError={(e) =>
//                     (e.target.src = "https://via.placeholder.com/50")
//                   }
//                 />
//               </div>
//             )
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Header;

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux"; // Import useDispatch
import axios from "axios";

// Import setUser action
import { setUser } from "./../../slices/userSlice"; // Adjust the path based on your file structure

// styles
import styles from "./Header.module.css";

// assets
import navbarlogo from "../../assets/NexFellowLogo.svg";

// icons
import { FaSearch } from "react-icons/fa";
import { AiOutlineBell, AiFillBell } from "react-icons/ai";

function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [Path, setPath] = useState();
  const dispatch = useDispatch(); // Initialize dispatch
  const user = useSelector((state) => state.user.user);

  const toggleModal = () => setIsModalOpen((prev) => !prev);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const userId = userData;
        if (!userId) {
          throw new Error("User ID is missing");
        }
        console.log("userId", user);
      } catch (err) {
        setError("Failed to load user data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    setPath(location.pathname);
    fetchUserData();
  }, [location.pathname, dispatch]);

  console.log("PATH", Path);

  const handleRedirect = () => {
    if (user) {
      navigate(`/dashboard/${user.id}`);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className={styles.header}>
      <div className={styles.navbarLogo}>
        <Link to="/">
          <img
            className={styles.navbarlogo}
            src={navbarlogo}
            alt="NexFellow logo"
            onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
          />
        </Link>
      </div>
      <div className={styles.headRight}>
        {Path === "/view-emails" || Path === "/contact" ? (
          <div className={styles.searchContainer}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search"
              className={styles.searchBar}
            />
          </div>
        ) : null}
        <div className={styles.headRightRight}>
          {Path === "/view-emails" || Path === "/contact" ? (
            <div onClick={toggleModal} style={{ cursor: "pointer" }}>
              {isModalOpen ? (
                <AiFillBell size={28} color="#24B2B4" />
              ) : (
                <AiOutlineBell size={28} color="#000" />
              )}
            </div>
          ) : null}
          {isModalOpen && <NotificationModal closeModal={toggleModal} />}

          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className={styles.error}>{error}</p>
          ) : (
            user && (
              <div
                className={styles.profileLink}
                onClick={handleRedirect}
                style={{ cursor: "pointer" }}
              >
                <img
                  className={styles.dp}
                  src={user.profilePhoto || "https://via.placeholder.com/50"}
                  alt={user.username || "User"}
                  onError={(e) =>
                    (e.target.src = "https://via.placeholder.com/50")
                  }
                />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
