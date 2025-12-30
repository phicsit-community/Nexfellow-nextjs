import React, { useEffect, useState, useRef } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import SideBar from "../../Components/SideBar/SideBar";
import Loader from "../../Components/Loader/Loader";
import styles from "./Advertisements.module.css";
import uploadImg from "./assets/upload.svg";
import live from "./assets/live.png";
import location from "./assets/location.png";
import upload2 from "./assets/upload2.svg";
import top from "./assets/top.png";
import bottom from "./assets/bottom.png";
import pause from "./assets/pause.svg";
import resume from "./assets/resume.svg";

// const AdCard = ({ ad, onToggle, onDelete, onPositionChange }) => (
//   <div className={styles.adCard}>
//     <img
//       src={ad.imageUrl}
//       alt={`Ad at ${ad.position}`}
//       onError={(e) => {
//         e.target.onerror = null;
//         e.target.src = "https://via.placeholder.com/300x100?text=Ad+Image";
//       }}
//       className={styles.adImage}
//     />
//     <div className={styles.adDetails}>
//       <h4>
//         Position: {ad.position.charAt(0).toUpperCase() + ad.position.slice(1)}
//       </h4>
//       <p>
//         <strong>Status:</strong>{" "}
//         <span className={ad.isActive ? styles.active : styles.inactive}>
//           {ad.isActive ? "Active" : "Inactive"}
//         </span>
//       </p>
//       <div className={styles.controls}>
//         <button
//           onClick={() => onToggle(ad._id, ad.isActive)}
//           className={styles.toggleButton}
//         >
//           {ad.isActive ? "Deactivate" : "Activate"}
//         </button>

//         <select
//           value={ad.position}
//           onChange={(e) => onPositionChange(ad._id, e.target.value)}
//           className={styles.positionDropdown}
//         >
//           <option value="top">Top</option>
//           <option value="bottom">Bottom</option>
//         </select>

//         <button
//           onClick={() => onDelete(ad._id)}
//           className={styles.deleteButton}
//         >
//           Delete
//         </button>
//       </div>
//     </div>
//   </div>
// );

const AdCard = ({ ad, onToggle, onDelete, onPositionChange }) => {
  return (
    <div className={styles.adCard}>
      <img
        src={ad.imageUrl}
        alt={`Ad at ${ad.position}`}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://via.placeholder.com/300x100?text=Ad+Image";
        }}
        className={styles.adImage}
      />

      <div className={styles.adDetails}>
        <div className={styles.adHeader}>
          <div className={styles.adInfo}>
            <h4 className={styles.adTitle}>{ad.title || "Untitled Ad"}</h4>
            {ad.targetUrl && (
              <a
                href={ad.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.adLink}
              >
                {ad.targetUrl}
              </a>
            )}
          </div>
          <div className={styles.iconActions}>
            <span className={styles.iconEdit}>✏️</span>
            <span
              className={styles.iconDelete}
              onClick={() => onDelete(ad._id)}
            >
              🗑️
            </span>
          </div>
        </div>

        <div className={styles.badges}>
          <span className={`${styles.badge} ${styles[ad.position]}`}>
            {ad.position}
          </span>
          <span
            className={`${styles.badge} ${
              styles[ad.isActive ? "active" : "paused"]
            }`}
          >
            {ad.isActive ? "active" : "paused"}
          </span>
        </div>

        <div className={styles.adStats}>
          <div>
            <strong>{ad.clicks || 0}</strong> Clicks
          </div>
          <div>
            <strong>{ad.views || 0}</strong> Views
          </div>
          <div>
            <strong>{ad.ctr || "0.00%"}</strong> CTR
          </div>
        </div>

        <button
          className={styles.resumeBtn}
          onClick={() => onToggle(ad._id, ad.isActive)}
        >
          <img src={ad.isActive ? pause : resume} className={styles.pauseResumeIMG} />
          {ad.isActive ? "Pause" : "Resume"}
        </button>
      </div>
    </div>
  );
};

const Advertisements = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState("top");
  const fileInputRef = useRef(null);
  const [title, setTitle] = useState("");
  const [targetUrl, setTargetUrl] = useState("");

  const fetchAds = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/advertisements`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch advertisements");
      const data = await response.json();
      setAds(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  const handleUpload = async () => {
    if (!image) return alert("Please select an image.");

    const formData = new FormData();
    formData.append("image", image);
    formData.append("position", selectedPosition);
    formData.append("title", title);
    formData.append("targetUrl", targetUrl);

    console.log(image, selectedPosition);
    setIsUploading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${apiUrl}/advertisements/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
        credentials: "include",
      });

      if (!response.ok) throw new Error("Upload failed");

      alert("Uploaded successfully.");
      setImage(null);
      setSelectedPosition("top");
      setTitle("");
      setTargetUrl("");

      fetchAds();
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this advertisement?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/advertisements/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Delete failed");

      alert("Deleted successfully.");
      fetchAds();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete.");
    }
  };

  const toggleStatus = async (id, current) => {
    try {
      console.log("Toggling status for ad:", id, "Current status:", current);
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/advertisements/${id}/toggle`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !current }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Status update failed");

      fetchAds();
    } catch (err) {
      console.error("Toggle error:", err);
      alert("Failed to update status.");
    }
  };

  const updatePosition = async (id, newPos) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/advertisements/${id}/position`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ position: newPos }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Position update failed");

      fetchAds();
    } catch (err) {
      console.error("Position update error:", err);
      alert("Failed to update position.");
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const topAds = ads.filter((ad) => ad.position === "top");
  const bottomAds = ads.filter((ad) => ad.position === "bottom");

  return (
    <div>
      <Navbar />
      <SideBar />
      <main className={styles.advertisementPage}>
        <div className={styles.wrapper}>
          <div className={styles.pageTitle}>Advertisement Management</div>
          <p className={styles.pageSubtitle}>
            Upload and manage your advertisements
          </p>

          {loading ? (
            <Loader />
          ) : (
            <>
              {/* Upload Section */}
              <div className={styles.topSection}>
                <div className={styles.uploadCard}>
                  <h3 className={styles.sectionTitle}>
                    Upload New Advertisement
                  </h3>

                  <div
                    className={styles.uploadBox}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files?.[0]) {
                        setImage(e.dataTransfer.files[0]);
                      }
                    }}
                  >
                    <div className={styles.uploadPlaceholder}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={isUploading}
                        className={styles.uploadInput}
                      />
                      <img alt="" className={styles.iconImg} src={uploadImg} />
                      <p>Click or drag an image here</p>
                      <p className={styles.uploadHint}>
                        PNG, JPG, GIF up to 10MB
                      </p>
                      <button className={styles.uploadBtn}>Choose File</button>
                    </div>
                  </div>

                  <p>Advertisement Title</p>
                  <input
                    className={styles.input}
                    placeholder="Enter advertisement title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />

                  <p>Target URL</p>
                  <input
                    className={styles.input}
                    placeholder="https://example.com"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                  />

                  <p>Ad Position</p>
                  <div className={styles.positionToggle}>
                    <button
                      className={`${styles.positionBtn} ${
                        selectedPosition === "top" ? styles.active : ""
                      }`}
                      onClick={() => setSelectedPosition("top")}
                    >
                      <img alt="" className={styles.iconImg} src={top} /> Top
                    </button>
                    <button
                      className={`${styles.positionBtn} ${
                        selectedPosition === "bottom" ? styles.active : ""
                      }`}
                      onClick={() => setSelectedPosition("bottom")}
                    >
                      <img alt="" className={styles.iconImg} src={bottom} />{" "}
                      Bottom
                    </button>
                  </div>

                  <button
                    className={styles.uploadAdBtn}
                    onClick={handleUpload}
                    disabled={isUploading}
                  >
                    {isUploading ? "Uploading..." : "Upload Advertisement"}
                  </button>
                </div>

                {/* Live Preview */}
                <div className={styles.previewCard}>
                  <div className={styles.previewLabel}>
                    <img alt="" className={styles.iconImg} src={live} />
                    <span>Live Preview</span>
                  </div>
                  <div className={styles.previewBox}>
                    {image ? (
                      <img
                        src={URL.createObjectURL(image)}
                        alt="Preview"
                        className={styles.previewImage}
                      />
                    ) : (
                      <>
                        <img
                          alt=""
                          className={styles.previewImage}
                          src={upload2}
                        />
                        <p className={styles.previewText}>
                          Upload an image to see preview
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Current Ads List */}
              <div className={styles.currentAds}>
                <h3 className={styles.sectionTitle}>Current Advertisements</h3>
                <h4 className={styles.groupTitle}>Top Advertisements</h4>
                <div className={styles.adsContainer}>
                  {topAds.length ? (
                    topAds.map((ad) => (
                      <AdCard
                        key={ad._id}
                        ad={ad}
                        onToggle={toggleStatus}
                        onDelete={handleDelete}
                        onPositionChange={updatePosition}
                      />
                    ))
                  ) : (
                    <p className={styles.fallbackText}>No top ads available.</p>
                  )}
                </div>

                <h4 className={styles.groupTitle}>Bottom Advertisements</h4>
                <div className={styles.adsContainer}>
                  {bottomAds.length ? (
                    bottomAds.map((ad) => (
                      <AdCard
                        key={ad._id}
                        ad={ad}
                        onToggle={toggleStatus}
                        onDelete={handleDelete}
                        onPositionChange={updatePosition}
                      />
                    ))
                  ) : (
                    <p className={styles.fallbackText}>
                      No bottom ads available.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Advertisements;
