import { useState } from "react";
import styles from "./Table.module.css";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { RiDeleteBin6Line } from "react-icons/ri";
import Pagination from "../Pagination/Pagination";
import no_profile_pic from "../../assests/Userpage/Nopicture.png";
import verifiedBadge from "../../assests/badges/verified.svg";
import premiumBadge from "../../assests/badges/premium.png";
import communityBadge from "../../assests/badges/community.svg";
import Delete from "../../assests/Icons/delete.png";
import Loader from "../Loader/Loader";

const Table = ({ searchQuery, data, setData, loading, setLoading }) => {
  const apiUrl = import.meta.env.VITE_API_URL;

  console.log("Data in Table:", data);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  const filteredData = data.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Delete User Confirmation
  const deleteUser = async (id) => {
    confirmAlert({
      title: "Confirm",
      message: "Are you sure you want to delete this user?",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            setLoading(true);
            try {
              const response = await fetch(`${apiUrl}/admin/deleteuser/${id}`, {
                method: "DELETE",
                credentials: "include",
              });

              const result = await response.json();

              if (response.ok) {
                setData((prevData) => prevData.filter((user) => user._id !== id));
                alert(result.message || "User deleted successfully");
              } else {
                alert(result.message || "Failed to delete user");
              }
            } catch (error) {
              console.error("Error deleting user:", error);
              alert("An error occurred while deleting the user. Please try again.");
            } finally {
              setLoading(false);
            }
          },
        },
        {
          label: "No",
          onClick: () => { },
        },
      ],
    });
  };

  // Toggle Verification Badge
  const onToggleVerification = (id, currentStatus) => {
    confirmAlert({
      title: "Confirm",
      message:
        "Are you sure you want to change the verification status of this user?",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            const newStatus = !currentStatus;
            setData((prevData) =>
              prevData.map((user) =>
                user._id === id
                  ? { ...user, verificationBadge: newStatus }
                  : user
              )
            );

            try {
              const response = await fetch(`${apiUrl}/admin/givebadge/${id}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
              });

              if (!response.ok) {
                throw new Error("Failed to update user verification status");
              }

              const updatedUser = await response.json();
              setData((prevData) =>
                prevData.map((user) =>
                  user._id === id
                    ? {
                      ...user,
                      verificationBadge: updatedUser.verificationBadge,
                      communityBadge: updatedUser.communityBadge,
                      createdCommunity: user.createdCommunity
                        ? { ...user.createdCommunity, accountType: updatedUser.accountType }
                        : user.createdCommunity,
                    }
                    : user
                )
              );
            } catch (error) {
              console.error("Error updating user verification status:", error);
              alert(
                "An error occurred while updating the verification status. Please try again."
              );
            }
          },
        },
        {
          label: "No",
          onClick: () => { },
        },
      ],
    });
  };

  // Give Premium Badge
  const givePremiumBadge = (id, currentStatus) => {
    confirmAlert({
      title: "Confirm",
      message:
        "Are you sure you want to change the premium badge status of this user?",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            const newStatus = !currentStatus;
            setData((prevData) =>
              prevData.map((user) =>
                user._id === id ? { ...user, premiumBadge: newStatus } : user
              )
            );

            try {
              const response = await fetch(
                `${apiUrl}/admin/premiumbadge/${id}`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  credentials: "include",
                }
              );

              if (!response.ok) {
                throw new Error("Failed to update user premium badge status");
              }

              const updatedUser = await response.json();
              setData((prevData) =>
                prevData.map((user) =>
                  user._id === id
                    ? { ...user, premiumBadge: updatedUser.premiumBadge }
                    : user
                )
              );
            } catch (error) {
              console.error("Error updating user premium badge status:", error);
              alert(
                "An error occurred while updating the premium badge status. Please try again."
              );
            }
          },
        },
        {
          label: "No",
          onClick: () => { },
        },
      ],
    });
  };

  // Give Community Badge
  const giveCommunityBadge = (id, currentStatus) => {
    confirmAlert({
      title: "Confirm",
      message: "Are you sure you want to change the community badge status?",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            const newStatus = !currentStatus;

            // Optimistically update UI
            setData((prevData) =>
              prevData.map((user) =>
                user._id === id
                  ? { ...user, communityBadge: newStatus }
                  : user
              )
            );

            try {
              const response = await fetch(
                `${apiUrl}/admin/communitybadge/${id}`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  credentials: "include",
                }
              );

              if (!response.ok) {
                throw new Error("Failed to update community badge");
              }

              const updatedUser = await response.json();

              // Final update with backend values

              setData((prevData) =>
                prevData.map((user) =>
                  user._id === id
                    ? {
                      ...user,
                      communityBadge: updatedUser.communityBadge,
                      verificationBadge: updatedUser.verificationBadge,
                      createdCommunity: user.createdCommunity
                        ? { ...user.createdCommunity, accountType: updatedUser.accountType }
                        : user.createdCommunity,
                    }
                    : user
                )
              );
            } catch (error) {
              console.error("Error updating community badge:", error);
              alert("Failed to update community badge. Please try again.");
            }
          },
        },
        {
          label: "No",
          onClick: () => { },
        },
      ],
    });
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>User</th>
            <th>Contact</th>
            <th>Joined On</th>
            <th>Country</th>
            <th>Verified Badge</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="5"><Loader /></td></tr>
          ) : (
            paginatedData.map((user, index) => (
              <tr key={`${user._id}-${index}`}>
                <td className={styles.userCell}>
                  <div className={styles.userImg}>
                    <img src={user?.picture || no_profile_pic} alt="User" />
                  </div>
                  <div className={styles.userInfo}>
                    <div className={styles.userName}>{user.name}</div>
                    <div className={styles.username}>@{user.username}</div>
                  </div>
                </td>
                <td>
                  <div className={styles.email}>
                    {user.email}

                    {/* <div className={styles.phoneNumber}>
                      {user?.phoneNumber && user.phoneNumber !== "undefined"
                        ? user.phoneNumber
                        : "N/A"}
                    </div> */}
                  </div>
                </td>
                <td>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    : "N/A"}
                </td>
                <td>
                  {user.country || "N/A"}
                </td>
                <td className={styles.badgeCell}>
                  {/* Verification Badge */}
                  <button onClick={() => onToggleVerification(user._id, user.verificationBadge)}>
                    <img
                      src={verifiedBadge}
                      className={user.verificationBadge ? styles.verifiedimg : styles.unverifiedimg}
                      alt="Verification Badge"
                    />
                  </button>

                  {/* Premium Badge */}
                  {/* <button onClick={() => givePremiumBadge(user._id, user.premiumBadge)}>
                    <img
                      src={premiumBadge}
                      className={user.premiumBadge ? styles.verifiedimg : styles.unverifiedimg}
                      alt="Premium Badge"
                    />
                  </button> */}

                  {/* Community Badge */}
                  <button
                    onClick={() =>
                      user.createdCommunity &&
                      giveCommunityBadge(
                        user._id,
                        user.communityBadge
                      )
                    }
                    disabled={!user.createdCommunity}
                    title={
                      user.createdCommunity
                        ? "Toggle Community Badge"
                        : "User has not created a community"
                    }
                    className={`${styles.badgeButton} ${!user.createdCommunity ? styles.disabled : ""}`}
                  >
                    <img
                      src={communityBadge}
                      className={
                        user.communityBadge
                          ? styles.verifiedimg
                          : styles.unverifiedimg
                      }
                      alt="Community Badge"
                    />
                  </button>
                </td>
                <td>
                  <button onClick={() => deleteUser(user._id)}>
                    <img src={Delete} alt="Delete" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <Pagination totalPages={Math.ceil(filteredData.length / itemsPerPage)} currentPage={currentPage} onPageChange={setCurrentPage} />
    </div>
  );
};

export default Table;
