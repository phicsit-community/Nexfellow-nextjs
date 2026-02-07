'use client';

import { useState, useEffect } from 'react';
import { FiGlobe, FiStar, FiEye } from 'react-icons/fi';
import { IoIosSearch } from 'react-icons/io';
import { BsGripVertical } from 'react-icons/bs';
import { toast } from 'sonner';
import { safeFetch } from '@/lib/safeFetch';

interface CommunityOwner {
    _id: string;
    name?: string;
    username?: string;
    email?: string;
}

interface Community {
    _id: string;
    name?: string;
    communityName?: string;
    description?: string;
    coverImage?: string;
    profileImage?: string;
    membersCount?: number;
    totalPosts?: number;
    createdAt?: string;
    owner?: CommunityOwner;
}

export default function FeaturedCommunitiesPage() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [allCommunities, setAllCommunities] = useState<Community[]>([]);
    const [featuredCommunities, setFeaturedCommunities] = useState<Community[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const handleDragStart = (index: number) => {
        setDragIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDragEnd = () => {
        if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
            const newList = [...featuredCommunities];
            const [draggedItem] = newList.splice(dragIndex, 1);
            newList.splice(dragOverIndex, 0, draggedItem);
            setFeaturedCommunities(newList);
            setHasChanges(true);
        }
        setDragIndex(null);
        setDragOverIndex(null);
    };

    useEffect(() => {
        const fetchCommunities = async () => {
            setLoading(true);
            try {
                // Fetch all communities
                const allRes = await safeFetch(`${apiUrl}/admin/communities`);
                if (allRes.ok) {
                    const data = await allRes.json();
                    setAllCommunities(Array.isArray(data) ? data : []);
                }

                // Fetch featured communities
                const featuredRes = await safeFetch(`${apiUrl}/admin/featured-communities`);
                if (featuredRes.ok) {
                    const data = await featuredRes.json();
                    setFeaturedCommunities(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error('Failed to load communities:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCommunities();
    }, [apiUrl]);

    const getCommunityName = (c: Community) => c.owner?.name || c.name || c.communityName || 'Unnamed Community';
    const getCommunityInitials = (c: Community) => {
        const name = getCommunityName(c);
        return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    };

    const handleAdd = (comm: Community) => {
        if (featuredCommunities.find((f) => f._id === comm._id)) {
            toast.error('Community already featured');
            return;
        }
        if (featuredCommunities.length >= 10) {
            toast.error('Maximum 10 featured communities allowed');
            return;
        }
        setFeaturedCommunities([...featuredCommunities, comm]);
        setHasChanges(true);
    };

    const handleRemove = (id: string) => {
        setFeaturedCommunities(featuredCommunities.filter((f) => f._id !== id));
        setHasChanges(true);
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        const newList = [...featuredCommunities];
        [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
        setFeaturedCommunities(newList);
        setHasChanges(true);
    };

    const moveDown = (index: number) => {
        if (index === featuredCommunities.length - 1) return;
        const newList = [...featuredCommunities];
        [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
        setFeaturedCommunities(newList);
        setHasChanges(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await safeFetch(`${apiUrl}/admin/featured-communities`, {
                method: 'PUT',
                body: JSON.stringify({ communityIds: featuredCommunities.map((c) => c._id) }),
            });

            if (res.ok) {
                toast.success('Featured communities saved successfully!');
                setHasChanges(false);
            } else {
                toast.error('Failed to save featured communities');
            }
        } catch {
            toast.error('Failed to save featured communities');
        } finally {
            setSaving(false);
        }
    };

    const availableCommunities = allCommunities.filter(
        (c) =>
            !featuredCommunities.find((f) => f._id === c._id) &&
            getCommunityName(c).toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">All Communities</h1>
                <p className="text-gray-500 mt-1">Manage and feature your communities</p>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-4 mb-8">
                <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 flex items-center gap-4 shadow-sm">
                    <div>
                        <p className="text-gray-500 text-sm">Total Communities</p>
                        <p className="text-2xl font-bold text-gray-900">{allCommunities.length}</p>
                    </div>
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                        <FiGlobe className="text-teal-600 text-xl" />
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 flex items-center gap-4 shadow-sm">
                    <div>
                        <p className="text-gray-500 text-sm">Featured</p>
                        <p className="text-2xl font-bold text-teal-600">{featuredCommunities.length}</p>
                    </div>
                    <FiStar className="text-teal-500 text-2xl" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* All Communities - Left Side */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">All Communities</h2>
                        <span className="text-gray-500 text-sm">{availableCommunities.length} communities</span>
                    </div>

                    {/* Search */}
                    <div className="relative mb-4">
                        <IoIosSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search communities..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Communities List */}
                    <div className="space-y-3 max-h-125 overflow-y-auto">
                        {loading ? (
                            <p className="text-gray-500 text-center py-8">Loading...</p>
                        ) : availableCommunities.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No communities available</p>
                        ) : (
                            availableCommunities.map((comm) => (
                                <div
                                    key={comm._id}
                                    className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all"
                                >
                                    <div className="grid grid-cols-2 gap-0.5 shrink-0">
                                        {[...Array(6)].map((_, i) => <span key={i} className="w-1 h-1 bg-gray-300 rounded-full" />)}
                                    </div>
                                    <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center shrink-0">
                                        {(comm.coverImage || comm.profileImage) ? (
                                            <img
                                                src={comm.coverImage || comm.profileImage}
                                                alt={getCommunityName(comm)}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        ) : (
                                            <span className="text-white font-bold text-sm">{getCommunityInitials(comm)}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-900 font-semibold truncate">{getCommunityName(comm)}</p>
                                        <p className="text-gray-500 text-sm truncate">{comm.description?.slice(0, 40) || 'No description available'}</p>
                                    </div>
                                    <button
                                        onClick={() => handleAdd(comm)}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                                    >
                                        <FiStar className="text-xs" />
                                        Feature
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Featured Communities - Right Side */}
                <div>
                    <div className="bg-white rounded-2xl border-2 border-dashed border-teal-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <FiStar className="text-teal-500" />
                                <h2 className="text-lg font-semibold text-gray-900">Featured Communities</h2>
                            </div>
                            <span className="text-gray-500 text-sm">{featuredCommunities.length} featured</span>
                        </div>

                        {featuredCommunities.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No featured communities. Add from the list on the left.</p>
                        ) : (
                            <div className="space-y-4 max-h-125 overflow-y-auto pr-1">
                                {featuredCommunities.map((comm, index) => (
                                    <div
                                        key={comm._id}
                                        draggable
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                        className={`relative bg-gray-50 border border-teal-200 rounded-2xl p-5 transition-all ${
                                            dragIndex === index ? 'opacity-50 scale-95' : ''
                                        } ${dragOverIndex === index && dragIndex !== index ? 'border-teal-500 border-2' : ''}`}
                                    >
                                        {/* Rank Badge */}
                                        <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
                                            <div className="w-7 h-7 bg-teal-600 rounded-full flex items-center justify-center shadow-lg">
                                                <span className="text-white text-xs font-bold">{index + 1}</span>
                                            </div>
                                            <FiStar className="text-teal-500 text-lg" />
                                        </div>

                                        <div className="flex items-center gap-4 mb-5">
                                            <BsGripVertical className="text-gray-300 text-xl shrink-0 cursor-grab active:cursor-grabbing hover:text-teal-500 transition-colors" />
                                            <div className="w-14 h-14 bg-teal-600 rounded-xl flex items-center justify-center shrink-0">
                                                {(comm.coverImage || comm.profileImage) ? (
                                                    <img
                                                        src={comm.coverImage || comm.profileImage}
                                                        alt={getCommunityName(comm)}
                                                        className="w-full h-full object-cover rounded-xl"
                                                    />
                                                ) : (
                                                    <span className="text-white font-bold text-base">{getCommunityInitials(comm)}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-gray-900 font-semibold truncate text-lg">{getCommunityName(comm)}</p>
                                                <p className="text-gray-500 text-sm truncate mt-0.5">{comm.description?.slice(0, 40) || 'No description available'}</p>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                            <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition-colors">
                                                <FiEye className="text-sm" />
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleRemove(comm._id)}
                                                className="px-4 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                                            >
                                                ✕ Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={saving || !hasChanges}
                        className="w-full mt-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-teal-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving...' : 'Save Featured Order'}
                    </button>
                </div>
            </div>
        </div>
    );
}
