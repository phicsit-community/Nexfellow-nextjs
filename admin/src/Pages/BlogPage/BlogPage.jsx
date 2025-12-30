import React, { useEffect, useState } from "react";
import styles from "./BlogPage.module.css";
import Navbar from "../../Components/Navbar/Navbar";
import SideBar from "../../Components/SideBar/SideBar";
import { IoIosSearch } from "react-icons/io";
import BlogWriter from "./BlogWriter";

const BlogPage = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [blogs, setBlogs] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [isWriting, setIsWriting] = useState(false);
    const [editBlog, setEditBlog] = useState(null);

    const fetchBlogs = () => {
        setLoading(true);
        fetch(`${apiUrl}/admin/blogs`, { credentials: "include" })
            .then((res) => {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then((data) => {
                console.log("Fetched blogs data:", data); // 👈 Add this line!
                setBlogs(Array.isArray(data) ? data : []);
            })
            .catch(() => setErrorMsg("Failed to load blogs."))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchBlogs();
    }, [apiUrl]);

    const filteredBlogs = blogs.filter(
        (blog) =>
            blog.title?.toLowerCase().includes(search.toLowerCase()) ||
            blog.author?.name?.toLowerCase().includes(search.toLowerCase()) ||
            blog.category?.toLowerCase().includes(search.toLowerCase())
    );

    const handleAction = (blogId, action) => {
        setLoading(true);
        setSuccessMsg("");
        setErrorMsg("");

        if (action === "edit") {
            const blog = blogs.find((b) => b._id === blogId);
            if (blog) openEditBlogWriter(blog);
            setLoading(false);
            return;
        }

        let url = `${apiUrl}/admin/blogs/${blogId}`;
        let method = "POST";

        if (action === "delete") {
            method = "DELETE";
        } else if (action === "publish" || action === "unpublish") {
            url = `${apiUrl}/admin/blogs/${blogId}/${action}`;
            method = "POST";
        }

        fetch(url, {
            method,
            credentials: "include",
        })
            .then((res) => {
                if (!res.ok) throw new Error();
                setSuccessMsg("Action successful!");
                return fetch(`${apiUrl}/admin/blogs`, { credentials: "include" });
            })
            .then((res) => res.json())
            .then((data) => setBlogs(Array.isArray(data) ? data : []))
            .catch(() => setErrorMsg("Action failed."))
            .finally(() => setLoading(false));
    };

    const openNewBlogWriter = () => {
        setEditBlog(null);
        setSuccessMsg("");
        setErrorMsg("");
        setIsWriting(true);
    };

    const openEditBlogWriter = (blog) => {
        setEditBlog(blog);
        setSuccessMsg("");
        setErrorMsg("");
        setIsWriting(true);
    };

    const handleWriterClose = (reload = false) => {
        setIsWriting(false);
        setEditBlog(null);
        if (reload) fetchBlogs();
    };

    const formatDate = (date) =>
        date ? new Date(date).toLocaleDateString(undefined, {
            year: "numeric", month: "short", day: "numeric"
        }) : "";

    return (
        <>
            <Navbar />
            <SideBar />
            <div className={styles.pageWrapper}>
                <div className={styles.panelContainer}>
                    {!isWriting ? (
                        <>
                            <div className={styles.header}>
                                <div>
                                    <p className={styles.mainTitle}>All Blogs</p>
                                    <p className={styles.subTitle}>Manage and moderate blog posts</p>
                                </div>
                                <button className={styles.writeBtn} onClick={openNewBlogWriter}>
                                    + Write New Blog
                                </button>
                            </div>

                            <div className={styles.summarySection}>
                                <div className={styles.summaryCard}>
                                    <div>
                                        <p className={styles.summaryLabel}>Total Blogs</p>
                                        <p className={styles.summaryValue}>{blogs.length}</p>
                                    </div>
                                </div>
                                <div className={styles.summaryCard}>
                                    <div>
                                        <p className={styles.summaryLabel}>Published</p>
                                        <p className={styles.summaryValue}>
                                            {blogs.filter((b) => b.status === "published").length}
                                        </p>
                                    </div>
                                </div>
                                <div className={styles.summaryCard}>
                                    <div>
                                        <p className={styles.summaryLabel}>Drafts</p>
                                        <p className={styles.summaryValue}>
                                            {blogs.filter((b) => b.status === "draft").length}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.blogSection}>
                                <div className={styles.blogHeader}>
                                    <p className={styles.blogTitle}>Blog Posts</p>
                                    <div className={styles.searchContainer}>
                                        <IoIosSearch className={styles.searchIcon} />
                                        <input
                                            type="text"
                                            placeholder="Search blogs, authors, or categories..."
                                            className={styles.searchInput}
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className={styles.blogList}>
                                    {loading ? (
                                        <p>Loading...</p>
                                    ) : filteredBlogs.length === 0 ? (
                                        <p>No blogs found</p>
                                    ) : (
                                        filteredBlogs.map((blog) => (
                                            <div key={blog._id} className={styles.blogCard}>
                                                {blog.coverUrl && (
                                                    <div className={styles.blogCardCover}>
                                                        <img src={blog.coverUrl} alt="cover" />
                                                    </div>
                                                )}
                                                <div className={styles.blogCardBody}>
                                                    <div className={styles.blogCardHeader}>
                                                        <span className={styles.cardCategory}>
                                                            {blog.category || "Uncategorized"}
                                                        </span>
                                                        <span
                                                            className={
                                                                blog.status === "published"
                                                                    ? styles.statusPublished
                                                                    : styles.statusDraft
                                                            }
                                                        >
                                                            {blog.status}
                                                        </span>
                                                    </div>
                                                    <p className={styles.blogName}>{blog.title}</p>
                                                    <div className={styles.cardTags}>
                                                        {Array.isArray(blog.tags) && blog.tags.map((tag, idx) => (
                                                            <span key={idx} className={styles.cardTag}>
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "0.7rem",
                                                        margin: "0.2rem 0 0.2rem 0"
                                                    }}>
                                                        {blog.author?.imageUrl &&
                                                            <img src={blog.author.imageUrl} alt="author"
                                                                style={{
                                                                    width: 34,
                                                                    height: 34,
                                                                    borderRadius: "50%",
                                                                    objectFit: "cover",
                                                                }}
                                                            />
                                                        }
                                                        <div>
                                                            <span className={styles.blogAuthor}>
                                                                {blog.author?.name || "Unknown"}
                                                                {blog.author?.position ? `, ${blog.author.position}` : ""}
                                                            </span>
                                                            <div className={styles.blogDate}>
                                                                {formatDate(blog.publishedAt) || formatDate(blog.createdAt)}
                                                                {blog.readTime && <> • {blog.readTime}</>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {blog.author?.bio && (
                                                        <div style={{
                                                            fontSize: "0.93rem",
                                                            color: "#88a",
                                                            marginBottom: 2
                                                        }}>
                                                            {blog.author.bio}
                                                        </div>
                                                    )}
                                                    <div className={styles.blogActions}>
                                                        <button onClick={() => openEditBlogWriter(blog)}>
                                                            Edit
                                                        </button>
                                                        <button onClick={() => handleAction(blog._id, "delete")}>
                                                            Delete
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleAction(
                                                                    blog._id,
                                                                    blog.status === "published"
                                                                        ? "unpublish"
                                                                        : "publish"
                                                                )
                                                            }
                                                        >
                                                            {blog.status === "published" ? "Unpublish" : "Publish"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                {successMsg && <span className={styles.successMsg}>{successMsg}</span>}
                                {errorMsg && <span className={styles.errorMsg}>{errorMsg}</span>}
                            </div>
                        </>
                    ) : (
                        <BlogWriter
                            blogToEdit={editBlog}
                            onCancel={() => handleWriterClose(false)}
                            onSave={() => handleWriterClose(true)}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default BlogPage;
