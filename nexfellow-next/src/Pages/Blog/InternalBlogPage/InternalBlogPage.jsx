"use client";

import { useState, useEffect } from "react";
import api from "../../../lib/axios";
import Footer from "../../../components/Landing/Footer/Footer";
import ContactCTA from "../../../components/Landing/ContactCTA/ContactCTA";
import Navbar from "../../../components/Landing/Navbar/Navbar";
import styles from "./InternalBlogPage.module.css";
import Link from "next/link";
import { useParams } from "next/navigation";
import blogImage from "./assets/image.svg";
import authorImage from "./assets/author.svg";
import Markdown from "react-markdown";
import { ClockIcon, CalendarIcon } from "lucide-react";
import Hamburger from "hamburger-react";

export const InternalBlogPage = () => {
  const params = useParams();
  const blogId = params?.id;
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Extract headings for table of contents
  const getHeadings = (content) => {
    if (!content) return [];
    // Match markdown headings: ##, ###, ####, etc.
    const headingRegex = /^(#{2,6})\s+(.*)$/gm;
    const headings = [];
    let match;
    while ((match = headingRegex.exec(content))) {
      const level = match[1].length;
      const text = match[2].trim();
      // Generate anchor id (simple slug)
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      headings.push({ level, text, id });
    }
    return headings;
  };

  useEffect(() => {
    setLoading(true);
    axios
      .get(`/blogs/${blogId}`)
      .then((res) => {
        setBlog(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Blog not found");
        console.error(err);
        setLoading(false);
      });
  }, [blogId]);

  // Table of contents headings
  const toc = blog ? getHeadings(blog.content) : [];

  // Detect mobile screen
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  return (
    <div className={styles.container}>
      <Navbar />
      <>
        <div className={styles.blogWrapper}>
          <div className={styles.backLink}>
            <Link href="/blogs">← Back to Blog</Link>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>
          ) : error ? (
            <div style={{ padding: 40, textAlign: "center", color: "red" }}>
              {error}
            </div>
          ) : blog ? (
            <>
              <div className={styles.headerSection}>
                <div className={styles.headerContent}>
                  <span className={styles.tag}>{blog.category}</span>
                  <h1 className={styles.title}>{blog.title}</h1>
                  <div className={styles.authorSection}>
                    <div className={styles.authorInfo}>
                      <img
                        src={blog.author?.imageUrl || authorImage}
                        alt="Author"
                        width={40}
                        height={40}
                        className={styles.avatar}
                      />
                      <div>
                        <p className={styles.authorName}>
                          {blog.author?.name || "Unknown Author"}
                        </p>
                        <p className={styles.authorRole}>
                          {blog.author?.position || ""}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className={styles.meta}>
                    <CalendarIcon
                      style={{ verticalAlign: "middle" }}
                      className="inline"
                      size={14}
                    />{" "}
                    {blog.publishedAt
                      ? new Date(blog.publishedAt).toLocaleDateString()
                      : ""}
                    {blog.readTime && (
                      <>
                        {" • "}
                        <ClockIcon
                          style={{ verticalAlign: "middle" }}
                          className="inline"
                          size={14}
                        />{" "}
                        {blog.readTime}
                      </>
                    )}
                  </p>
                </div>
                <div className={styles.blogImage}>
                  <img
                    src={blog.coverUrl || blogImage}
                    alt={blog.title}
                    width={800}
                    height={400}
                    className={styles.heroImg}
                  />
                </div>
              </div>

              <div className={styles.contentWrapper}>
                {isMobile && (
                  <button
                    aria-label={
                      sidebarOpen
                        ? "Close Table of Contents"
                        : "Open Table of Contents"
                    }
                    className={styles.sidebarToggle}
                    onClick={() => setSidebarOpen((open) => !open)}
                    style={{
                      position: "fixed",
                      right: "2vw",
                      bottom: "2vw",
                      background: "#222",
                      color: "#fff",
                      border: "none",
                      borderRadius: "50px",
                      padding: "6px 12px",
                      cursor: "pointer",
                      fontSize: "1rem",
                      zIndex: 120,
                      boxShadow: "0 2px 12px #0004",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#444")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#222")
                    }
                  >
                    {/* {sidebarOpen
                      ? "Hide Table of Contents"
                      : "Show Table of Contents"} */}

                    <Hamburger size={20} toggled={sidebarOpen} />
                  </button>
                )}
                <aside
                  className={styles.sidebar}
                  style={
                    isMobile
                      ? {
                        position: "fixed",
                        top: 0,
                        left: sidebarOpen ? 0 : "-100vw",
                        width: "80vw",
                        maxWidth: "350px",
                        height: "100vh",
                        background: "rgba(30,41,59,0.98)",
                        transition: "left 0.3s",
                        zIndex: 10000,
                        overflowY: "auto",
                        boxShadow: sidebarOpen ? "2px 0 12px #0006" : "none",
                      }
                      : {}
                  }
                  aria-hidden={!sidebarOpen && isMobile}
                  tabIndex={sidebarOpen || !isMobile ? 0 : -1}
                >
                  <h3>Table Of Contents</h3>
                  <ul>
                    {toc.length === 0 ? (
                      <li>No headings found</li>
                    ) : (
                      toc.map((h) => (
                        <li
                          key={h.id}
                          style={{ marginLeft: (h.level - 2) * 12 }}
                          onClick={setSidebarOpen.bind(null, false)}
                        >
                          <a href={`#${h.id}`}>{h.text}</a>
                        </li>
                      ))
                    )}
                  </ul>
                  {isMobile && sidebarOpen && (
                    <button
                      aria-label="Close Table of Contents"
                      onClick={() => setSidebarOpen(false)}
                      style={{
                        marginTop: "2rem",
                        background: "#222",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        padding: "8px 16px",
                        cursor: "pointer",
                        fontSize: "1rem",
                      }}
                    >
                      Close
                    </button>
                  )}
                </aside>

                <article className={styles.content}>
                  {/* Render markdown content */}
                  <Markdown
                    components={{
                      h2: ({ node, ...props }) => {
                        const text = String(props.children);
                        const id = text
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-+|-+$/g, "");
                        return <h2 id={id} {...props} />;
                      },
                      h3: ({ node, ...props }) => {
                        const text = String(props.children);
                        const id = text
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-+|-+$/g, "");
                        return <h3 id={id} {...props} />;
                      },
                      h4: ({ node, ...props }) => {
                        const text = String(props.children);
                        const id = text
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-+|-+$/g, "");
                        return <h4 id={id} {...props} />;
                      },
                      code: ({
                        node,
                        inline,
                        className,
                        children,
                        ...props
                      }) => {
                        if (inline) {
                          // Inline code (single backticks)
                          return (
                            <code
                              className={styles.inlineCode}
                              style={{
                                background: "#f5f2f0",
                                color: "#c7254e",
                                borderRadius: "4px",
                                padding: "2px 4px",
                                fontSize: "0.95em",
                                fontFamily: "monospace",
                              }}
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        }
                        // Code block (triple backticks)
                        return (
                          <pre
                            className={styles.codeBlock}
                            style={{
                              background: "#222",
                              color: "#fff",
                              borderRadius: "8px",
                              padding: "16px",
                              overflowX: "auto",
                              margin: "18px 0",
                              fontSize: "1em",
                            }}
                          >
                            <code
                              style={{
                                background: "none",
                                color: "inherit",
                                fontFamily: "monospace",
                              }}
                              {...props}
                            >
                              {children}
                            </code>
                          </pre>
                        );
                      },
                    }}
                  >
                    {blog.content || ""}
                  </Markdown>
                  <div className={styles.tags}>
                    {blog.tags &&
                      blog.tags.length > 0 &&
                      blog.tags.map((tag) => (
                        <span key={tag} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                  </div>
                </article>
              </div>
            </>
          ) : null}
        </div>
        <ContactCTA />
        <Footer />
      </>
    </div>
  );
};
