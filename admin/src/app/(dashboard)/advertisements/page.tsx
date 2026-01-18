'use client';

import { useState, useEffect, useRef } from 'react';
import { MdOutlineCampaign } from 'react-icons/md';
import { FiPlus, FiEdit2, FiTrash2, FiUpload } from 'react-icons/fi';
import { toast } from 'sonner';
import Image from 'next/image';

interface Advertisement {
    _id: string;
    title: string;
    imageUrl: string;
    link: string;
    isActive: boolean;
    position: number;
    createdAt: string;
}

export default function AdvertisementsPage() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [ads, setAds] = useState<Advertisement[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form states
    const [newTitle, setNewTitle] = useState('');
    const [newLink, setNewLink] = useState('');
    const [newImage, setNewImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchAds = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/admin/advertisements`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setAds(Array.isArray(data) ? data.sort((a: Advertisement, b: Advertisement) => a.position - b.position) : []);
            }
        } catch (error) {
            console.error('Failed to load advertisements:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, [apiUrl]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!newImage || !newTitle.trim()) {
            toast.error('Title and image are required');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('image', newImage);
        formData.append('title', newTitle);
        formData.append('link', newLink);

        try {
            const res = await fetch(`${apiUrl}/admin/advertisements`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (res.ok) {
                toast.success('Advertisement uploaded successfully');
                setNewTitle('');
                setNewLink('');
                setNewImage(null);
                setPreviewUrl('');
                setShowForm(false);
                fetchAds();
            } else {
                toast.error('Failed to upload advertisement');
            }
        } catch {
            toast.error('Failed to upload advertisement');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this advertisement?')) return;

        try {
            const res = await fetch(`${apiUrl}/admin/advertisements/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (res.ok) {
                toast.success('Advertisement deleted');
                setAds((prev) => prev.filter((ad) => ad._id !== id));
            } else {
                toast.error('Failed to delete advertisement');
            }
        } catch {
            toast.error('Failed to delete advertisement');
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`${apiUrl}/admin/advertisements/${id}/toggle`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ isActive: !currentStatus }),
            });

            if (res.ok) {
                toast.success(`Advertisement ${currentStatus ? 'deactivated' : 'activated'}`);
                setAds((prev) =>
                    prev.map((ad) => (ad._id === id ? { ...ad, isActive: !currentStatus } : ad))
                );
            } else {
                toast.error('Failed to toggle status');
            }
        } catch {
            toast.error('Failed to toggle status');
        }
    };

    const updatePosition = async (id: string, newPos: number) => {
        try {
            const res = await fetch(`${apiUrl}/admin/advertisements/${id}/position`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ position: newPos }),
            });

            if (res.ok) {
                toast.success('Position updated');
                fetchAds();
            } else {
                toast.error('Failed to update position');
            }
        } catch {
            toast.error('Failed to update position');
        }
    };

    return (
        <div className="min-h-screen p-6">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <MdOutlineCampaign className="text-2xl text-teal-400" />
                    <div>
                        <h1 className="text-2xl font-semibold text-white">Advertisements</h1>
                        <p className="text-slate-400">Manage platform advertisements</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <FiPlus className="w-5 h-5" />
                    {showForm ? 'Cancel' : 'Add New Ad'}
                </button>
            </div>

            {/* Upload Form */}
            {showForm && (
                <div className="bg-slate-800 rounded-xl p-6 mb-8">
                    <h2 className="text-lg font-semibold text-white mb-4">Upload New Advertisement</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-slate-300 text-sm mb-2">Title *</label>
                                <input
                                    type="text"
                                    placeholder="Advertisement title"
                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 text-sm mb-2">Link URL</label>
                                <input
                                    type="url"
                                    placeholder="https://example.com"
                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                                    value={newLink}
                                    onChange={(e) => setNewLink(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 text-sm mb-2">Image *</label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-600 transition-colors"
                                >
                                    <FiUpload /> Choose Image
                                </button>
                            </div>
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="w-full py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                            >
                                {uploading ? 'Uploading...' : 'Upload Advertisement'}
                            </button>
                        </div>
                        <div className="flex items-center justify-center">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="max-h-48 rounded-lg" />
                            ) : (
                                <div className="w-full h-48 bg-slate-700 rounded-lg flex items-center justify-center text-slate-400">
                                    Image preview
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">Total Ads</p>
                    <p className="text-2xl font-bold text-white">{ads.length}</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">Active</p>
                    <p className="text-2xl font-bold text-green-400">{ads.filter((ad) => ad.isActive).length}</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">Inactive</p>
                    <p className="text-2xl font-bold text-yellow-400">{ads.filter((ad) => !ad.isActive).length}</p>
                </div>
            </div>

            {/* Ads Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p className="text-slate-400">Loading...</p>
                ) : ads.length === 0 ? (
                    <p className="text-slate-400">No advertisements found</p>
                ) : (
                    ads.map((ad) => (
                        <div key={ad._id} className="bg-slate-700 rounded-lg overflow-hidden">
                            {ad.imageUrl && (
                                <div className="h-40 overflow-hidden relative">
                                    <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                                    <div className="absolute top-2 right-2">
                                        <span
                                            className={`text-xs px-2 py-1 rounded ${ad.isActive ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'
                                                }`}
                                        >
                                            {ad.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div className="p-4">
                                <h3 className="text-white font-medium mb-2">{ad.title}</h3>
                                <p className="text-slate-400 text-sm truncate mb-3">{ad.link || 'No link'}</p>

                                <div className="flex items-center gap-2 mb-3">
                                    <label className="text-slate-400 text-sm">Position:</label>
                                    <select
                                        value={ad.position}
                                        onChange={(e) => updatePosition(ad._id, parseInt(e.target.value))}
                                        className="bg-slate-600 text-white rounded px-2 py-1 text-sm"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((pos) => (
                                            <option key={pos} value={pos}>{pos}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleStatus(ad._id, ad.isActive)}
                                        className={`flex-1 text-xs py-2 rounded transition-colors ${ad.isActive
                                                ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                            }`}
                                    >
                                        {ad.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(ad._id)}
                                        className="flex items-center justify-center gap-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors text-xs"
                                    >
                                        <FiTrash2 /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
