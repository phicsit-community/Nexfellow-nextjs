'use client';

import { useEffect, useState } from 'react';
import { IoIosSearch } from 'react-icons/io';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { toast } from 'sonner';
import Image from 'next/image';
import { safeFetch } from '@/lib/safeFetch';

interface Blog {
    _id: string;
    title: string;
    category?: string;
    status: 'draft' | 'published';
    content?: string;
    author?: {
        name?: string;
        imageUrl?: string;
        position?: string;
        bio?: string;
    };
    coverUrl?: string;
    tags?: string[];
    createdAt?: string;
    publishedAt?: string;
    readTime?: string;
}

interface BlogWriterProps {
    blogToEdit: Blog | null;
    onCancel: () => void;
    onSave: () => void;
}

const BlogWriter: React.FC<BlogWriterProps> = ({ blogToEdit, onCancel, onSave }) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const [category, setCategory] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [readTime, setReadTime] = useState('');
    const [publishedAt, setPublishedAt] = useState('');
    const [cover, setCover] = useState<File | null>(null);
    const [authorName, setAuthorName] = useState('');
    const [authorPosition, setAuthorPosition] = useState('');
    const [authorBio, setAuthorBio] = useState('');
    const [authorImage, setAuthorImage] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        if (blogToEdit) {
            setCategory(blogToEdit.category || '');
            setTitle(blogToEdit.title || '');
            setContent(blogToEdit.content || '');
            setTags(Array.isArray(blogToEdit.tags) ? blogToEdit.tags.join(', ') : blogToEdit.tags || '');
            setReadTime(blogToEdit.readTime || '');
            setPublishedAt(blogToEdit.publishedAt ? new Date(blogToEdit.publishedAt).toISOString().slice(0, 16) : '');
            setAuthorName(blogToEdit.author?.name || '');
            setAuthorPosition(blogToEdit.author?.position || '');
            setAuthorBio(blogToEdit.author?.bio || '');
        } else {
            setCategory('');
            setTitle('');
            setContent('');
            setTags('');
            setReadTime('');
            setPublishedAt('');
            setAuthorName('');
            setAuthorPosition('');
            setAuthorBio('');
        }
    }, [blogToEdit]);

    const handleSave = async (status: 'draft' | 'published') => {
        setSaving(true);

        const formData = new FormData();
        formData.append('category', category);
        formData.append('title', title);
        formData.append('content', content);
        formData.append('tags', tags);
        formData.append('status', status);
        formData.append('readTime', readTime);
        if (publishedAt) formData.append('publishedAt', new Date(publishedAt).toISOString());
        if (cover) formData.append('cover', cover);
        formData.append('authorName', authorName);
        formData.append('authorPosition', authorPosition);
        formData.append('authorBio', authorBio);
        if (authorImage) formData.append('authorImage', authorImage);

        const url = blogToEdit ? `${apiUrl}/admin/blogs/${blogToEdit._id}` : `${apiUrl}/admin/blogs`;
        const method = blogToEdit ? 'PUT' : 'POST';

        try {
            const res = await safeFetch(url, { method, body: formData });
            if (!res.ok) throw new Error();
            toast.success(status === 'published' ? 'Blog published!' : 'Draft saved!');
            onSave();
        } catch {
            toast.error('Failed to save blog.');
        } finally {
            setSaving(false);
        }
    };

    const coverPreviewUrl = cover ? URL.createObjectURL(cover) : blogToEdit?.coverUrl || '';
    const authorImagePreviewUrl = authorImage ? URL.createObjectURL(authorImage) : blogToEdit?.author?.imageUrl || '';

    return (
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">{blogToEdit ? 'Edit Blog' : 'Write a Blog'}</h2>
                <p className="text-gray-500 text-sm">Create and publish new content</p>
            </div>

            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="Blog Title"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Category (e.g. Networking)"
                        className="px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Tags (comma separated)"
                        className="px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Read time (e.g. 6 min read)"
                        className="px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        value={readTime}
                        onChange={(e) => setReadTime(e.target.value)}
                    />
                    <input
                        type="datetime-local"
                        className="px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        value={publishedAt}
                        onChange={(e) => setPublishedAt(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-gray-700 text-sm mb-2 font-medium">Cover Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        className="text-gray-600"
                        onChange={(e) => setCover(e.target.files?.[0] || null)}
                    />
                    {coverPreviewUrl && (
                        <img src={coverPreviewUrl} alt="Cover" className="mt-2 max-w-xs rounded-lg" />
                    )}
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h3 className="text-gray-900 font-medium mb-3">Author Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Author Name"
                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Position (e.g. Sr. Editor)"
                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                            value={authorPosition}
                            onChange={(e) => setAuthorPosition(e.target.value)}
                        />
                    </div>
                    <textarea
                        placeholder="Author Bio"
                        className="w-full mt-3 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        rows={2}
                        value={authorBio}
                        onChange={(e) => setAuthorBio(e.target.value)}
                    />
                    <div className="mt-3">
                        <label className="block text-gray-600 text-sm mb-1">Author Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            className="text-gray-600"
                            onChange={(e) => setAuthorImage(e.target.files?.[0] || null)}
                        />
                        {authorImagePreviewUrl && (
                            <img src={authorImagePreviewUrl} alt="Author" className="mt-2 w-16 h-16 rounded-full object-cover" />
                        )}
                    </div>
                </div>

                <div className="flex gap-2 mb-2">
                    <button
                        className={`px-4 py-2 rounded-lg ${!showPreview ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                        onClick={() => setShowPreview(false)}
                    >
                        Editor
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg ${showPreview ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                        onClick={() => setShowPreview(true)}
                    >
                        Preview
                    </button>
                </div>

                {!showPreview ? (
                    <textarea
                        placeholder="Write your blog content in markdown..."
                        className="w-full min-h-75 px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 resize-y font-mono focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                ) : (
                    <div className="bg-white rounded-lg p-6 text-gray-800 min-h-75">
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">{category || 'Uncategorized'}</span>
                        <h1 className="text-2xl font-bold mt-2">{title || 'Untitled'}</h1>
                        {coverPreviewUrl && <img src={coverPreviewUrl} alt="Cover" className="w-full mt-4 rounded-lg" />}
                        <div className="mt-4 whitespace-pre-wrap">{content}</div>
                        <div className="flex items-center mt-6 pt-4 border-t">
                            {authorImagePreviewUrl && <img src={authorImagePreviewUrl} alt="Author" className="w-10 h-10 rounded-full mr-3" />}
                            <div>
                                <p className="font-medium">{authorName}</p>
                                <p className="text-sm text-gray-500">{authorPosition}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={() => handleSave('draft')}
                        disabled={saving}
                        className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                        Save as Draft
                    </button>
                    <button
                        onClick={() => handleSave('published')}
                        disabled={saving}
                        className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                        Publish
                    </button>
                    <button
                        onClick={onCancel}
                        disabled={saving}
                        className="px-6 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function BlogsPage() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [isWriting, setIsWriting] = useState(false);
    const [editBlog, setEditBlog] = useState<Blog | null>(null);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const res = await safeFetch(`${apiUrl}/admin/blogs`);
            if (res.ok) {
                const data = await res.json();
                setBlogs(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to load blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, [apiUrl]);

    const handleAction = async (blogId: string, action: 'delete' | 'publish' | 'unpublish') => {
        setLoading(true);
        let url = `${apiUrl}/admin/blogs/${blogId}`;
        let method = 'POST';

        if (action === 'delete') {
            method = 'DELETE';
        } else if (action === 'publish' || action === 'unpublish') {
            url = `${apiUrl}/admin/blogs/${blogId}/${action}`;
        }

        try {
            const res = await safeFetch(url, { method });
            if (res.ok) {
                toast.success(`Blog ${action}d successfully!`);
                fetchBlogs();
            } else {
                toast.error(`Failed to ${action} blog`);
            }
        } catch {
            toast.error('Action failed');
        } finally {
            setLoading(false);
        }
    };

    const openEditBlogWriter = (blog: Blog) => {
        setEditBlog(blog);
        setIsWriting(true);
    };

    const handleWriterClose = (reload = false) => {
        setIsWriting(false);
        setEditBlog(null);
        if (reload) fetchBlogs();
    };

    const filteredBlogs = blogs.filter(
        (blog) =>
            blog.title?.toLowerCase().includes(search.toLowerCase()) ||
            blog.author?.name?.toLowerCase().includes(search.toLowerCase()) ||
            blog.category?.toLowerCase().includes(search.toLowerCase())
    );

    const formatDate = (date?: string) =>
        date ? new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';

    if (isWriting) {
        return (
            <div className="h-full bg-gray-50 p-6 md:p-8 flex flex-col overflow-y-auto">
                <BlogWriter
                    blogToEdit={editBlog}
                    onCancel={() => handleWriterClose(false)}
                    onSave={() => handleWriterClose(true)}
                />
            </div>
        );
    }

    return (
        <div className="h-full bg-gray-50 p-6 md:p-8 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">All Blogs</h1>
                    <p className="text-gray-500">Manage and moderate blog posts</p>
                </div>
                <button
                    onClick={() => { setEditBlog(null); setIsWriting(true); }}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <FiPlus className="w-5 h-5" />
                    Write New Blog
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 shrink-0">
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm">Total Blogs</p>
                    <p className="text-2xl font-bold text-gray-900">{blogs.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm">Published</p>
                    <p className="text-2xl font-bold text-green-600">{blogs.filter((b) => b.status === 'published').length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm">Drafts</p>
                    <p className="text-2xl font-bold text-yellow-600">{blogs.filter((b) => b.status === 'draft').length}</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-4 shrink-0">
                <IoIosSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                <input
                    type="text"
                    placeholder="Search blogs, authors, or categories..."
                    className="w-full max-w-md pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Blog Grid */}
            <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <p className="text-gray-500">Loading...</p>
                    ) : filteredBlogs.length === 0 ? (
                        <p className="text-gray-500">No blogs found</p>
                    ) : (
                        filteredBlogs.map((blog) => (
                            <div key={blog._id} className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                {blog.coverUrl && (
                                    <div className="h-40 overflow-hidden">
                                        <img src={blog.coverUrl} alt="cover" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{blog.category || 'Uncategorized'}</span>
                                        <span className={`text-xs px-2 py-1 rounded font-medium ${blog.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {blog.status}
                                        </span>
                                    </div>
                                    <h3 className="text-gray-900 font-semibold mb-2">{blog.title}</h3>
                                    {blog.tags && blog.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {blog.tags.slice(0, 3).map((tag, i) => (
                                                <span key={i} className="text-xs text-teal-600">#{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                        {blog.author?.imageUrl && (
                                            <img src={blog.author.imageUrl} alt="author" className="w-6 h-6 rounded-full" />
                                        )}
                                        <span>{blog.author?.name || 'Unknown'}</span>
                                        <span>•</span>
                                        <span>{formatDate(blog.publishedAt) || formatDate(blog.createdAt)}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditBlogWriter(blog)}
                                            className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded transition-colors"
                                        >
                                            <FiEdit2 className="w-3 h-3" /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleAction(blog._id, 'delete')}
                                            className="flex items-center gap-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded transition-colors"
                                        >
                                            <FiTrash2 className="w-3 h-3" /> Delete
                                        </button>
                                        <button
                                            onClick={() => handleAction(blog._id, blog.status === 'published' ? 'unpublish' : 'publish')}
                                            className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-600 px-3 py-1.5 rounded transition-colors"
                                        >
                                            {blog.status === 'published' ? 'Unpublish' : 'Publish'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
