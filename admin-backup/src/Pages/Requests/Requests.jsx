import { useEffect, useState } from "react";
import styles from "./Requests.module.css";
import { IoIosSearch } from "react-icons/io";
import { AiOutlineUser } from "react-icons/ai";
import { MdPending, MdCheckCircle, MdCancel } from "react-icons/md";
import Navbar from "../../Components/Navbar/Navbar";
import SideBar from "../../Components/SideBar/SideBar";
import Loader from "../../Components/Loader/Loader";
import RequestView from "./RequestView";
import { LuDot } from "react-icons/lu";
import total from "./assets/total.svg";
import pending from "./assets/pending.svg";
import rejected from "./assets/rejected.svg";
import approved from "./assets/approved.svg";

const Requests = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    // Fetch Active Users Count
    const fetchActiveUsers = async () => {
      try {
        const res = await fetch(`${apiUrl}/admin/active-users/count`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setActiveUsers(data.activeUsers);
      } catch (e) {
        setActiveUsers(0);
      }
    };
    fetchActiveUsers();
  }, [apiUrl]);


  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/requests/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch requests");
      setRequests(data);
    } catch (error) {
      console.error("Failed to fetch requests:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Status counts
  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const approvedCount = requests.filter((r) => r.status === "Approved").length;
  const rejectedCount = requests.filter((r) => r.status === "Rejected").length;

  // Filtered and searched requests
  const filteredRequests = requests.filter((request) => {
    const name = request.userId?.name?.toLowerCase() || "";
    const username = request.userId?.username?.toLowerCase() || "";
    const matchesSearch =
      name.includes(searchQuery.toLowerCase()) ||
      username.includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Status badge styles
  const statusBadge = (status) => {
    if (status === "Approved") return styles.statusApproved;
    if (status === "Pending") return styles.statusPending;
    if (status === "Rejected") return styles.statusRejected;
    return "";
  };

  // Approve handler
  const handleApproveRequest = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/requests/${id}/approve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to approve request");
      }
      setSelectedRequest(null);
      await fetchRequests();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Reject handler
  const handleRejectRequest = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/requests/${id}/reject`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reject request");
      }
      setSelectedRequest(null);
      await fetchRequests();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <SideBar />
      {loading && <Loader />}
      <div className={styles.requestsPage}>
        {/* Header */}
        <div className={styles.headerRow}>
          <div>
            <div className={styles.pageTitle}>Verification</div>
            <div className={styles.pageSubtitle}>
              Communicate with your users instantly
            </div>
          </div>
          <div className={styles.activeUsersBadge}>
            {/* <AiOutlineUser style={{ marginRight: 6, fontSize: 18 }} /> */}
            <LuDot color="#00ff00" size={50} />
            {activeUsers.toLocaleString()} Active Users
          </div>
        </div>

        {/* Summary Cards */}
        <div className={styles.summaryCardsContainer}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryCardLabel}>
              <p>Total Requests</p>
              <div className={styles.summaryCardCount}>{totalCount}</div>
            </div>
            <img src={total} />
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryCardLabel}>
              <p>Pending</p>
              <div className={styles.summaryCardCount}>{pendingCount}</div>
            </div>
            <img src={pending} />
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryCardLabel}>
              <p>Approved</p>
              <div className={styles.summaryCardCount}>{approvedCount}</div>
            </div>
            <img src={approved} />
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryCardLabel}>
              <p>Rejected</p>
              <div className={styles.summaryCardCount}>{rejectedCount}</div>
            </div>
            <img src={rejected} />
          </div>
        </div>

        {/* Search & Filter */}
        <div className={styles.tableHeaderRow}>
          <div className={styles.searchContainer}>
            <IoIosSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by name, email, or community..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className={styles.statusFilter}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Table */}
        <div className={styles.tableContainer}>
          <div className={styles.table}>
            <div className={styles.tableRowHeader}>
              <div>Name</div>
              <div>Username</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
            {filteredRequests.map((request) => (
              <div className={styles.tableRow} key={request._id}>
                <div>{request.userId?.name || "Unknown"}</div>
                <div>{request.userId?.username || "Unknown"}</div>
                <div>
                  <span
                    className={`${styles.statusBadge} ${statusBadge(
                      request.status
                    )}`}
                  >
                    {request.status}
                  </span>
                </div>
                <div>
                  <button
                    className={styles.viewBtn}
                    onClick={() => setSelectedRequest(request)}
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
            {filteredRequests.length === 0 && (
              <div className={styles.noRequestsMessage}>
                No requests available.
              </div>
            )}
          </div>
        </div>
      </div>
      {selectedRequest && (
        <RequestView
          request={selectedRequest}
          onApprove={handleApproveRequest}
          onReject={handleRejectRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
};

export default Requests;
