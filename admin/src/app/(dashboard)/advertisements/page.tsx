'use client';

import { useState, useEffect, useRef } from 'react';
import { FiUpload, FiEdit2, FiTrash2, FiEye, FiArrowUp, FiArrowDown, FiPause, FiPlay } from 'react-icons/fi';
import { BsImage } from 'react-icons/bs';
import { toast } from 'sonner';
import Image from 'next/image';

interface Advertisement {
    _id: string;
    title: string;
    imageUrl: string;
    link: string;
    isActive: boolean;
    position: 'top' | 'bottom';
    clicks?: number;
    views?: number;
    createdAt: string;
}

export default function AdvertisementsPage() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [ads, setAds] = useState<Advertisement[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form states
    const [newTitle, setNewTitle] = useState('');
    const [newLink, setNewLink] = useState('');
    const [newPosition, setNewPosition] = useState<'top' | 'bottom'>('top');
    const [newImage, setNewImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchAds = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/admin/advertisements`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setAds(Array.isArray(data) ? data : []);
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
        formData.append('position', newPosition);

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
                setNewPosition('top');
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
                toast.success(`Advertisement ${currentStatus ? 'paused' : 'resumed'}`);
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

    const calculateCTR = (clicks?: number, views?: number) => {
        if (!views || views === 0) return '0.00';
        return ((clicks || 0) / views * 100).toFixed(2);
    };

    return (
        <div className="h-full bg-gray-50 p-6 md:p-8 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="mb-4 shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">Advertisement Management</h1>
                <p className="text-gray-500">Upload and manage your advertisements</p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-6">
            {/* Upload Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upload Form */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Upload New Advertisement</h2>

                    {/* Image Upload */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Advertisement Image</label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-teal-400 transition-colors"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                                    <FiUpload className="text-gray-400 text-xl" />
                                </div>
                                <p className="text-gray-900 font-medium mb-1">Click or drag an image here</p>
                                <p className="text-gray-400 text-sm">PNG, JPG, GIF up to 10MB</p>
                            </div>
                        </div>
                        {previewUrl && (
                            <div className="mt-4">
                                <img src={previewUrl} alt="Preview" className="h-24 rounded-lg object-contain" />
                            </div>
                        )}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                        >
                            Choose File
                        </button>
                    </div>

                    {/* Title Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Advertisement Title</label>
                        <input
                            type="text"
                            placeholder="Enter advertisement title"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        />
                    </div>

                    {/* URL Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Target URL</label>
                        <input
                            type="url"
                            placeholder="https://example.com"
                            value={newLink}
                            onChange={(e) => setNewLink(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        />
                    </div>

                    {/* Position Selector */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ad Position</label>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setNewPosition('top')}
                                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${newPosition === 'top'
                                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                            >
                                <FiArrowUp className="text-lg" />
                                <span className="font-medium">Top</span>
                            </button>
                            <button
                                onClick={() => setNewPosition('bottom')}
                                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${newPosition === 'bottom'
                                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                            >
                                <FiArrowDown className="text-lg" />
                                <span className="font-medium">Bottom</span>
                            </button>
                        </div>
                    </div>

                    {/* Upload Button */}
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <FiUpload />
                        {uploading ? 'Uploading...' : 'Upload Advertisement'}
                    </button>
                </div>

                {/* Live Preview */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <FiEye className="text-gray-400" />
                        <span className="text-gray-900 font-semibold">Live Preview</span>
                    </div>

                    <div className="text-xs text-gray-400 mb-3">
                        ◎ Position: {newPosition}
                    </div>

                    <div className="border border-dashed border-gray-200 rounded-xl p-8 min-h-50 flex items-center justify-center">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="max-h-40 rounded-lg object-contain" />
                        ) : (
                            <div className="text-center">
                                <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <BsImage className="text-gray-300 text-2xl" />
                                </div>
                                <p className="text-gray-400 text-sm">Upload an image to see preview</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Current Advertisements */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Current Advertisements</h2>

                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading...</div>
                ) : ads.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">No advertisements found</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ads.map((ad) => (
                            <div key={ad._id} className="border border-gray-100 rounded-xl overflow-hidden">
                                {/* Ad Image */}
                                <div className="h-40 bg-gray-100 relative overflow-hidden">
                                    {ad.imageUrl ? (
                                        <img
                                            src={ad.imageUrl}
                                            alt={ad.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BsImage className="text-gray-300 text-4xl" />
                                        </div>
                                    )}
                                </div>

                                {/* Ad Info */}
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold text-gray-900">{ad.title}</h3>
                                        <div className="flex gap-2">
                                            <button className="text-gray-400 hover:text-gray-600">
                                                <FiEdit2 className="text-sm" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(ad._id)}
                                                className="text-gray-400 hover:text-red-500"
                                            >
                                                <FiTrash2 className="text-sm" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Badges */}
                                    <div className="flex gap-2 mb-4">
                                        <span className={`px-2 py-0.5 text-xs rounded font-medium ${ad.position === 'bottom'
                                                ? 'bg-gray-800 text-white'
                                                : 'bg-teal-100 text-teal-700'
                                            }`}>
                                            {ad.position}
                                        </span>
                                        <span className={`px-2 py-0.5 text-xs rounded font-medium ${ad.isActive
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {ad.isActive ? 'active' : 'paused'}
                                        </span>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex justify-between text-center mb-4">
                                        <div>
                                            <p className="text-lg font-bold text-gray-900">{(ad.clicks || 0).toLocaleString()}</p>
                                            <p className="text-xs text-gray-400">Clicks</p>
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-gray-900">{(ad.views || 0).toLocaleString()}</p>
                                            <p className="text-xs text-gray-400">Views</p>
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-gray-900">{calculateCTR(ad.clicks, ad.views)}%</p>
                                            <p className="text-xs text-gray-400">CTR</p>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => toggleStatus(ad._id, ad.isActive)}
                                        className={`w-full py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${ad.isActive
                                                ? 'bg-teal-600 text-white hover:bg-teal-700'
                                                : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                                            }`}
                                    >
                                        {ad.isActive ? (
                                            <>
                                                <FiPause />
                                                Pause
                                            </>
                                        ) : (
                                            <>
                                                <FiPlay />
                                                Resume
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            </div>
        </div>
    );
}
