import React from "react";
import styles from "./BlogSection.module.css";
import icon from "./assets/Icon.svg";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const BlogSection = ({ blogs = [], loading }) => {
  // Featured blog: first published blog
  const featured = blogs && blogs.length > 0 ? blogs[0] : null;
  // Grid blogs: rest
  const gridBlogs = blogs && blogs.length > 1 ? blogs.slice(1) : [];
  const navigate = useNavigate();

  return (
    <div className={styles.blogSection}>
      {/* Featured Post */}
      <div className={styles.featuredPost}>
        {loading ? (
          <div className={styles.postContent}>
            <span className={styles.label}>Loading...</span>
            <h1>Loading...</h1>
            <div className={styles.author}>
              <div>
                <p>Loading...</p>
                <p>Loading...</p>
              </div>
            </div>
          </div>
        ) : featured ? (
          <>
            <div
              style={{
                cursor: "pointer",
              }}
              className={styles.postContent}
              onClick={() =>
                navigate(`/blogs/${featured.slug || featured._id}`)
              }
            >
              <span className={styles.label}>
                {featured.category || "Blog"}
              </span>
              <h1>{featured.title}</h1>
              <div className={styles.author}>
                <img src={featured.author?.imageUrl || icon} alt="Author" />
                <div>
                  <p>
                    {featured.author?.name || "Unknown Author"}
                    {featured.author?.position
                      ? `, ${featured.author.position}`
                      : ""}
                  </p>
                  <p>
                    {featured.publishedAt
                      ? new Date(featured.publishedAt).toLocaleDateString()
                      : ""}
                    {featured.readTime ? ` • ${featured.readTime}` : ""}
                  </p>
                </div>
              </div>
            </div>
            <img src={featured.coverUrl || icon} alt="Featured post" />
          </>
        ) : (
          <div className={styles.postContent}>
            <span className={styles.label}>No Blogs</span>
            <h1>No featured blog available.</h1>
          </div>
        )}
      </div>

      {/* Blog Grid */}
      <div className={styles.blogGrid}>
        {loading ? (
          Array(6)
            .fill(0)
            .map((_, idx) => (
              <div key={idx} className={styles.blogCard}>
                <div style={{ height: 180, background: "#eee" }} />
                <div>
                  <div>
                    <span className={styles.label}>Loading...</span>
                    <span className={styles.time}>• ...</span>
                  </div>
                  <div>
                    <h3>Loading...</h3>
                    <img className={styles.icon} src={icon} alt="Blog post" />
                  </div>
                </div>
              </div>
            ))
        ) : gridBlogs.length > 0 ? (
          gridBlogs.map((blog) => (
            <Link to={`/blogs/${blog.slug || blog._id}`} key={blog._id}>
              <div className={styles.blogCard}>
                <img src={blog.coverUrl || icon} alt={blog.title} />
                <div>
                  <div>
                    <span className={styles.label}>
                      {blog.category || "Blog"}{" "}
                      {blog.readTime ? (
                        <span className="text-white">• {blog.readTime}</span>
                      ) : (
                        ""
                      )}
                    </span>
                  </div>
                  <div>
                    <h3>{blog.title}</h3>
                    <img className={styles.icon} src={icon} alt="Blog post" />
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className={styles.blogCard}>
            <div>No blogs found.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogSection;
