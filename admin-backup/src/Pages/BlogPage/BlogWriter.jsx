import React, { useEffect, useState } from "react";
import styles from "./BlogWriter.module.css";
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";

const mdParser = new MarkdownIt();

const BlogWriter = ({ blogToEdit, onCancel, onSave }) => {
    const apiUrl = import.meta.env.VITE_API_URL;

    // Blog fields
    const [category, setCategory] = useState("");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState("");
    const [readTime, setReadTime] = useState("");
    const [publishedAt, setPublishedAt] = useState("");
    const [cover, setCover] = useState(null);

    // Author fields
    const [authorName, setAuthorName] = useState("");
    const [authorPosition, setAuthorPosition] = useState("");
    const [authorBio, setAuthorBio] = useState("");
    const [authorImage, setAuthorImage] = useState(null);

    // UI/State fields
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // Prefill on edit
    useEffect(() => {
        if (blogToEdit) {
            setCategory(blogToEdit.category || "");
            setTitle(blogToEdit.title || "");
            setContent(blogToEdit.content || "");
            setTags(Array.isArray(blogToEdit.tags) ? blogToEdit.tags.join(", ") : blogToEdit.tags || "");
            setCover(null); // New upload only; show old in preview (optional)
            setReadTime(blogToEdit.readTime || "");
            setPublishedAt(blogToEdit.publishedAt ? new Date(blogToEdit.publishedAt).toISOString().slice(0, 16) : "");
            setAuthorName(blogToEdit.author?.name || "");
            setAuthorPosition(blogToEdit.author?.position || "");
            setAuthorBio(blogToEdit.author?.bio || "");
            setAuthorImage(null); // New upload only; show old in preview (optional)
        } else {
            setCategory("");
            setTitle("");
            setContent("");
            setTags("");
            setCover(null);
            setReadTime("");
            setPublishedAt("");
            setAuthorName("");
            setAuthorPosition("");
            setAuthorBio("");
            setAuthorImage(null);
        }
        setSuccessMsg("");
        setErrorMsg("");
    }, [blogToEdit]);

    const handleEditorChange = ({ text }) => setContent(text);

    const handleSave = (status) => {
        setSaving(true);
        setSuccessMsg("");
        setErrorMsg("");

        const formData = new FormData();
        formData.append("category", category);
        formData.append("title", title);
        formData.append("content", content);
        formData.append("tags", tags);
        formData.append("status", status);
        formData.append("readTime", readTime);
        // Only set if filled
        if (publishedAt) formData.append("publishedAt", new Date(publishedAt).toISOString());
        if (cover) formData.append("cover", cover);
        // Author subfields
        formData.append("authorName", authorName);
        formData.append("authorPosition", authorPosition);
        formData.append("authorBio", authorBio);
        if (authorImage) formData.append("authorImage", authorImage);

        const url = blogToEdit
            ? `${apiUrl}/admin/blogs/${blogToEdit._id}`
            : `${apiUrl}/admin/blogs`;
        const method = blogToEdit ? "PUT" : "POST";

        fetch(url, {
            method,
            body: formData,
            credentials: "include",
        })
            .then((res) => {
                if (!res.ok) throw new Error();
                setSuccessMsg(
                    status === "published"
                        ? "Blog published successfully!"
                        : "Draft saved successfully!"
                );
                onSave();
            })
            .catch(() => setErrorMsg("Failed to save blog."))
            .finally(() => setSaving(false));
    };

    // For previewing uploaded images immediately
    const coverPreviewUrl =
        cover
            ? URL.createObjectURL(cover)
            : blogToEdit?.coverUrl || "";

    const authorImagePreviewUrl =
        authorImage
            ? URL.createObjectURL(authorImage)
            : blogToEdit?.author?.imageUrl || "";

    return (
        <div className={styles.writerContainer}>
            <div className={styles.header}>
                <p className={styles.mainTitle}>
                    {blogToEdit ? "Edit Blog" : "Write a Blog"}
                </p>
                <p className={styles.subTitle}>Create and publish new content</p>
            </div>

            <div className={styles.writerForm}>
                {/* Blog fields */}
                <input
                    className={styles.input}
                    type="text"
                    placeholder="Blog Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <input
                    className={styles.input}
                    type="text"
                    placeholder="Category (e.g. Networking)"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                />
                <input
                    className={styles.input}
                    type="text"
                    placeholder="Tags (comma separated)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                />
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        className={styles.input}
                        type="text"
                        placeholder="Read time (e.g. 6 min read)"
                        value={readTime}
                        onChange={(e) => setReadTime(e.target.value)}
                        style={{ flex: 2 }}
                    />
                    <input
                        className={styles.input}
                        type="datetime-local"
                        placeholder="Published at"
                        value={publishedAt}
                        onChange={(e) => setPublishedAt(e.target.value)}
                        style={{ flex: 2 }}
                    />
                </div>
                <div>
                    <label style={{ fontWeight: '600' }}>Cover Image</label>
                    <input
                        className={styles.input}
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCover(e.target.files[0])}
                    />
                    {coverPreviewUrl && (
                        <img
                            src={coverPreviewUrl}
                            alt="Cover Preview"
                            className={styles.coverImage}
                            style={{ maxWidth: 320, marginTop: 8 }}
                        />
                    )}
                </div>

                {/* Author fields */}
                <div className={styles.authorFields}>
                    <div style={{ marginBottom: 8, fontWeight: 600 }}>Author Information</div>
                    <input
                        className={styles.input}
                        type="text"
                        placeholder="Author Name"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        required
                    />
                    <input
                        className={styles.input}
                        type="text"
                        placeholder="Author Position (e.g. Sr. Editor)"
                        value={authorPosition}
                        onChange={(e) => setAuthorPosition(e.target.value)}
                    />
                    <textarea
                        className={styles.input}
                        style={{ minHeight: '4rem' }}
                        placeholder="Author Bio"
                        value={authorBio}
                        onChange={(e) => setAuthorBio(e.target.value)}
                    />
                    <div>
                        <label style={{ fontWeight: '600' }}>Author Profile Image</label>
                        <input
                            className={styles.input}
                            type="file"
                            accept="image/*"
                            onChange={(e) => setAuthorImage(e.target.files[0])}
                        />
                        {authorImagePreviewUrl && (
                            <img
                                src={authorImagePreviewUrl}
                                alt="Author Profile Preview"
                                className={styles.coverImage}
                                style={{ maxWidth: 150, marginTop: 8, borderRadius: '50%' }}
                            />
                        )}
                    </div>
                </div>

                {/* MARKDOWN EDITOR */}
                <div className={styles.togglePreview}>
                    <button
                        type="button"
                        className={!showPreview ? styles.activeTab : ""}
                        onClick={() => setShowPreview(false)}
                    >
                        Editor
                    </button>
                    <button
                        type="button"
                        className={showPreview ? styles.activeTab : ""}
                        onClick={() => setShowPreview(true)}
                    >
                        Preview
                    </button>
                </div>

                {!showPreview ? (
                    <MdEditor
                        value={content}
                        style={{
                            height: "450px",
                            width: "100%",
                            minWidth: 0,
                            fontSize: "1.08rem",
                            background: "#fff",
                            borderRadius: "8px",
                        }}
                        renderHTML={(text) => mdParser.render(text)}
                        onChange={handleEditorChange}
                    />
                ) : (
                    <article className={styles.blogPreview}>
                        <span className={styles.tag}>{category || "Uncategorized"}</span>
                        <h1 className={styles.title}>{title || "Untitled"}</h1>
                        {coverPreviewUrl && (
                            <img
                                src={coverPreviewUrl}
                                alt="Cover"
                                className={styles.coverImage}
                            />
                        )}
                        <div
                            dangerouslySetInnerHTML={{ __html: mdParser.render(content) }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '2rem' }}>
                            {authorImagePreviewUrl && (
                                <img
                                    src={authorImagePreviewUrl}
                                    alt="Author"
                                    style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 10 }}
                                />
                            )}
                            <div style={{ fontSize: '1rem', color: '#555' }}>
                                {authorName}
                                {authorPosition ? `, ${authorPosition}` : ""}
                                <br />
                                <span style={{ fontSize: '0.97em', color: '#7b7b93' }}>
                                    {readTime && `${readTime} • `}{publishedAt ? new Date(publishedAt).toLocaleDateString() : ""}
                                </span>
                            </div>
                        </div>
                        {authorBio && (
                            <div style={{ fontSize: '0.97em', color: '#626275', marginTop: 8 }}>
                                {authorBio}
                            </div>
                        )}
                    </article>
                )}

                <div className={styles.actions}>
                    <button onClick={() => handleSave("draft")} disabled={saving}>
                        Save as Draft
                    </button>
                    <button onClick={() => handleSave("published")} disabled={saving}>
                        Publish
                    </button>
                    <button onClick={onCancel} disabled={saving}>
                        Cancel
                    </button>
                </div>

                {successMsg && (
                    <span className={styles.successMsg}>{successMsg}</span>
                )}
                {errorMsg && <span className={styles.errorMsg}>{errorMsg}</span>}
            </div>
        </div>
    );
};

export default BlogWriter;
