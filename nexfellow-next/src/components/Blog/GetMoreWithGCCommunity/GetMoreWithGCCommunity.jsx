import React, { useMemo, useState } from "react";
import styles from "./GetMoreWithCommunity.module.css";

const GetMoreWithGCCommunity = ({
  blogs = [],
  loading,
  activeCategory = "All",
  setActiveCategory,
}) => {
  // Extract unique categories from blogs
  const categories = useMemo(() => {
    if (!blogs || !Array.isArray(blogs) || blogs.length === 0) return [];
    const cats = blogs.map((b) => b.category).filter(Boolean);
    return Array.from(new Set(cats));
  }, [blogs]);

  return (
    <section className={styles.featuresSection}>
      <h2 className={styles.heading}>
        Nex<span className={styles.highlight}>Fellow</span> Blogs
      </h2>
      <p className={styles.description}>
        Insider Strategies for Growing Strong Online Communities
      </p>
      <div className={styles.buttons}>
        <button
          className={`${styles.button} ${activeCategory === "All" ? styles.active : ""
            }`}
          onClick={() => setActiveCategory("All")}
        >
          All
        </button>
        {loading
          ? Array(3)
            .fill(0)
            .map((_, idx) => (
              <button key={idx} className={styles.button} disabled>
                Loading...
              </button>
            ))
          : categories.map((cat) => (
            <button
              key={cat}
              className={`${styles.button} ${activeCategory === cat ? styles.active : ""
                }`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
      </div>
    </section>
  );
};

export default GetMoreWithGCCommunity;
