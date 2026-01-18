'use client';

import { useEffect, useState } from 'react';
import { IoIosSearch } from 'react-icons/io';
import Image from 'next/image';
import styles from './BlogPage.module.css';

interface Author {
    name?: string;
    position?: string;
    bio?: string;
    imageUrl?: string;
}

interface Blog {
    _id: string;
    title: string;
    content?: string;
    coverUrl?: string;
    category?: string;
    tags?: string[];
    status: 'published' | 'draft';
    author?: Author;
    readTime?: string;
    publishedAt?: string;
    createdAt: string;
}

export function BlogsClient() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const fetchBlogs = () => {
        setLoading(true);
        fetch(`${apiUrl}/admin/blogs`, { credentials: 'include' })
            .then((res) => {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then((data) => {
                setBlogs(Array.isArray(data) ? data : []);
            })
            .catch(() => setErrorMsg('Failed to load blogs.'))
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

    const handleAction = (blogId: string, action: 'delete' | 'publish' | 'unpublish') => {
        setLoading(true);
        setSuccessMsg('');
        setErrorMsg('');

        let url = `${apiUrl}/admin/blogs/${blogId}`;
        let method = 'POST';

        if (action === 'delete') {
            method = 'DELETE';
        } else if (action === 'publish' || action === 'unpublish') {
            url = `${apiUrl}/admin/blogs/${blogId}/${action}`;
            method = 'POST';
        }

        fetch(url, {
            method,
            credentials: 'include',
        })
            .then((res) => {
                if (!res.ok) throw new Error();
                setSuccessMsg('Action successful!');
                return fetchBlogs();
            })
            .catch(() => setErrorMsg('Action failed.'))
            .finally(() => setLoading(false));
    };

    const formatDate = (date: string) =>
        date ? new Date(date).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric'
        }) : '';

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.panelContainer}>
                <div className={styles.header}>
                    <div>
                        <p className={styles.mainTitle}>All Blogs</p>
                        <p className={styles.subTitle}>Manage and moderate blog posts</p>
                    </div>
                    <button className={styles.writeBtn}>
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
                                {blogs.filter((b) => b.status === 'published').length}
                            </p>
                        </div>
                    </div>
                    <div className={styles.summaryCard}>
                        <div>
                            <p className={styles.summaryLabel}>Drafts</p>
                            <p className={styles.summaryValue}>
                                {blogs.filter((b) => b.status === 'draft').length}
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
                                                {blog.category || 'Uncategorized'}
                                            </span>
                                            <span
                                                className={
                                                    blog.status === 'published'
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
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.7rem',
                                            margin: '0.2rem 0 0.2rem 0'
                                        }}>
                                            {blog.author?.imageUrl &&
                                                <img src={blog.author.imageUrl} alt="author"
                                                    style={{
                                                        width: 34,
                                                        height: 34,
                                                        borderRadius: '50%',
                                                        objectFit: 'cover',
                                                    }}
                                                />
                                            }
                                            <div>
                                                <span className={styles.blogAuthor}>
                                                    {blog.author?.name || 'Unknown'}
                                                    {blog.author?.position ? `, ${blog.author.position}` : ''}
                                                </span>
                                                <div className={styles.blogDate}>
                                                    {formatDate(blog.publishedAt || '') || formatDate(blog.createdAt)}
                                                    {blog.readTime && <> • {blog.readTime}</>}
                                                </div>
                                            </div>
                                        </div>
                                        {blog.author?.bio && (
                                            <div style={{
                                                fontSize: '0.93rem',
                                                color: '#88a',
                                                marginBottom: 2
                                            }}>
                                                {blog.author.bio}
                                            </div>
                                        )}
                                        <div className={styles.blogActions}>
                                            <button>Edit</button>
                                            <button onClick={() => handleAction(blog._id, 'delete')}>
                                                Delete
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleAction(
                                                        blog._id,
                                                        blog.status === 'published'
                                                            ? 'unpublish'
                                                            : 'publish'
                                                    )
                                                }
                                            >
                                                {blog.status === 'published' ? 'Unpublish' : 'Publish'}
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
            </div>
        </div>
    );
}
