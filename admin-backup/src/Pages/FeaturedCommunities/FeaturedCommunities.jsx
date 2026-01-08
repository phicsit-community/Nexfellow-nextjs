import React, { useEffect, useState } from "react";
import styles from "./FeaturedCommunities.module.css";
import Navbar from "../../Components/Navbar/Navbar";
import SideBar from "../../Components/SideBar/SideBar";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import featuredIMG from "./assets/featured.svg";
import featuredicon from "./assets/featuredicon.svg";
import TC from "./assets/TC.svg";
import avatar from "./assets/avatar.svg";
import sixDots from "./assets/sixdots.svg";
import star from "./assets/star.svg";
import { IoIosSearch } from "react-icons/io";

const FeaturedCommunities = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [allCommunities, setAllCommunities] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchCommunities = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const [allRes, featuredRes] = await Promise.all([
          fetch(`${apiUrl}/admin/featured-communities`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          }),
          fetch(`${apiUrl}/explore/all-communities`, {
            credentials: "include",
          }),
        ]);

        if (!allRes.ok || !featuredRes.ok) throw new Error();

        const allData = await allRes.json();
        const featuredData = await featuredRes.json();

        setAllCommunities(Array.isArray(allData) ? allData : []);
        setFeatured(Array.isArray(featuredData) ? featuredData : []);
      } catch {
        setErrorMsg("Failed to load community data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, [apiUrl]);

  const getCommunityName = (c) => {
    return (
      c?.owner?.name ||
      c?.name ||
      c?.profile ||
      c?.shortDescription ||
      (typeof c?.description === "string" ? c.description.slice(0, 30) : "") ||
      "Unnamed"
    );
  };

  const handleAdd = (comm) => {
    if (!featured.some((f) => f._id === comm._id)) {
      setFeatured([...featured, comm]);
    }
  };

  const handleRemove = (id) => {
    setFeatured(featured.filter((c) => c._id !== id));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = [...featured];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFeatured(items);
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/admin/all-communities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ communityIds: featured.map((c) => c._id) }),
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      setSuccessMsg("Featured communities updated!");
    } catch {
      setErrorMsg("Failed to save featured communities.");
    } finally {
      setSaving(false);
      setTimeout(() => setSuccessMsg(""), 2000);
    }
  };

  const availableCommunities = allCommunities.filter(
    (c) =>
      !featured.some((f) => f._id === c._id) &&
      getCommunityName(c).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <SideBar />
      <div className={styles.pageWrapper}>
        <div className={styles.panelContainer}>
          <div className={styles.header}>
            <p className={styles.mainTitle}>All Communities</p>
            <p className={styles.subTitle}>
              Manage and feature your communities
            </p>
          </div>

          <div className={styles.summarySection}>
            <div className={styles.summaryCard}>
              <div>
                <p className={styles.summaryLabel}>Total Communities</p>
                <p className={styles.summaryValue}>{allCommunities.length}</p>
              </div>
              <img className={styles.summaryIcon} src={TC} />
            </div>
            <div className={styles.summaryCard}>
              <div>
                <p className={styles.summaryLabel}>Featured</p>
                <p
                  className={`${styles.summaryValue} ${styles.summaryValueFeatured}`}
                >
                  {featured.length}
                </p>
              </div>
              <img className={styles.summaryIcon} src={featuredIMG} />
            </div>
          </div>

          <div className={styles.communitySectionMain}>
            <div className={styles.communitySection}>
              <div className={styles.communityHeader}>
                <p className={styles.communityTitle}>All Communities</p>
                <p className={styles.communityCount}>
                  {availableCommunities.length} communities
                </p>
              </div>
              <div className={styles.searchContainer}>
                <IoIosSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search communities..."
                  className={styles.searchInput}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className={styles.communityList}>
                {loading ? (
                  <p>Loading...</p>
                ) : availableCommunities.length === 0 ? (
                  <p>No communities found</p>
                ) : (
                  availableCommunities.map((comm) => (
                    <div key={comm._id} className={styles.communityCard}>
                      <div className={styles.avatarWrapper}>
                        <img src={sixDots} alt="" className={styles.sixDots} />
                        <img src={avatar} alt="" className={styles.avatar} />
                      </div>
                      <div className={styles.communityInfo}>
                        <p className={styles.communityName}>
                          {getCommunityName(comm)}
                        </p>
                        <p className={styles.communityDesc}>
                          A community for tech enthusiasts and...
                        </p>
                      </div>
                      <div
                        className={styles.featureButtonWrapper}
                        onClick={() => handleAdd(comm)}
                      >
                        <img src={star} alt="" className={styles.featureIcon} />
                        <span className={styles.featureText}>Feature</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Duplicated section */}
            <div className={styles.panel}>
              <div className={styles.communityHeader}>
                <div className={styles.communityTitleWrapper}>
                  <img
                    src={featuredicon}
                    alt=""
                    className={styles.feauturedStarIcon}
                  />

                  <h3>Featured Communities</h3>
                </div>
                <span className={styles.communityCount}>
                  {featured.length} communities
                </span>
              </div>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="featured">
                  {(provided) => (
                    <div
                      className={styles.featuredList}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {featured.map((comm, index) => (
                        <Draggable
                          key={comm._id}
                          draggableId={comm._id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              className={`${styles.featuredItem} ${
                                snapshot.isDragging ? styles.dragging : ""
                              }`}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              {/* <span>{getCommunityName(comm)}</span>
                            <button
                              onClick={() => handleRemove(comm._id)}
                              className={styles.removeBtn}
                            >
                              Remove
                            </button> */}
                              <div
                                key={comm._id}
                                className={styles.communityCard}
                              >
                                <div className={styles.avatarWrapper}>
                                  <img
                                    src={sixDots}
                                    alt=""
                                    className={styles.sixDots}
                                  />
                                  <img
                                    src={avatar}
                                    alt=""
                                    className={styles.avatar}
                                  />
                                </div>
                                <div className={styles.communityInfo}>
                                  <p className={styles.communityName}>
                                    {getCommunityName(comm)}
                                  </p>
                                  <p className={styles.communityDesc}>
                                    A community for tech enthusiasts and...
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleRemove(comm._id)}
                                  className={styles.removeBtn}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <div className={styles.actions}>
                <button
                  onClick={handleSave}
                  disabled={saving || loading}
                  className={styles.saveBtn}
                >
                  {saving ? "Saving..." : "Save Featured Order"}
                </button>
                {successMsg && (
                  <span className={styles.successMsg}>{successMsg}</span>
                )}
                {errorMsg && (
                  <span className={styles.errorMsg}>{errorMsg}</span>
                )}
              </div>
            </div>
          </div>

          {/* Left: All Communities */}
          {/* <div className={styles.panel}>
                        <h3>All Communities</h3>
                        <input
                            className={styles.searchInput}
                            type="text"
                            placeholder="Search communities..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <div className={styles.communityList}>
                            {loading ? (
                                <p>Loading...</p>
                            ) : availableCommunities.length === 0 ? (
                                <p>No communities found</p>
                            ) : (
                                availableCommunities.map((comm) => (
                                    <div key={comm._id} className={styles.communityItem}>
                                        <span>{getCommunityName(comm)}</span>
                                        <button onClick={() => handleAdd(comm)} className={styles.addBtn}>
                                            Add
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div> */}
          {/* 
          <div className={styles.panel}>
            <h3>Featured Communities</h3>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="featured">
                {(provided) => (
                  <div
                    className={styles.featuredList}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {featured.map((comm, index) => (
                      <Draggable
                        key={comm._id}
                        draggableId={comm._id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            className={`${styles.featuredItem} ${
                              snapshot.isDragging ? styles.dragging : ""
                            }`}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <span>{getCommunityName(comm)}</span>
                            <button
                              onClick={() => handleRemove(comm._id)}
                              className={styles.removeBtn}
                            >
                              Remove
                            </button>
                            <div
                              key={comm._id}
                              className={styles.communityCard}
                            >
                              <div className={styles.avatarWrapper}>
                                <img
                                  src={sixDots}
                                  alt=""
                                  className={styles.sixDots}
                                />
                                <img
                                  src={avatar}
                                  alt=""
                                  className={styles.avatar}
                                />
                              </div>
                              <div className={styles.communityInfo}>
                                <p className={styles.communityName}>
                                  {getCommunityName(comm)}
                                </p>
                                <p className={styles.communityDesc}>
                                  A community for tech enthusiasts and...
                                </p>
                              </div>
                              <button
                                onClick={() => handleRemove(comm._id)}
                                className={styles.removeBtn}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            <div className={styles.actions}>
              <button
                onClick={handleSave}
                disabled={saving || loading}
                className={styles.saveBtn}
              >
                {saving ? "Saving..." : "Save Order"}
              </button>
              {successMsg && (
                <span className={styles.successMsg}>{successMsg}</span>
              )}
              {errorMsg && <span className={styles.errorMsg}>{errorMsg}</span>}
            </div>
          </div> */}
          {/* Right: Featured Communities */}
        </div>
      </div>
    </>
  );
};

export default FeaturedCommunities;
