'use client';

import { useState, useEffect } from 'react';
import { FiGlobe, FiStar, FiX, FiSave, FiMove } from 'react-icons/fi';
import { IoIosSearch } from 'react-icons/io';
import { toast } from 'sonner';
import Image from 'next/image';
import { safeFetch } from '@/lib/safeFetch';

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
}

export default function FeaturedCommunitiesPage() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [allCommunities, setAllCommunities] = useState<Community[]>([]);
    const [featuredCommunities, setFeaturedCommunities] = useState<Community[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

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

    const getCommunityName = (c: Community) => c.name || c.communityName || 'Unnamed Community';

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
        <div className="min-h-screen p-6">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <FiGlobe className="text-2xl text-teal-400" />
                    <div>
                        <h1 className="text-2xl font-semibold text-white">Featured Communities</h1>
                        <p className="text-slate-400">Manage homepage featured communities</p>
                    </div>
                </div>
                {hasChanges && (
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <FiSave />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Featured Communities */}
                <div className="bg-slate-800 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <FiStar className="text-yellow-400" />
                        <h2 className="text-lg font-semibold text-white">Featured ({featuredCommunities.length}/10)</h2>
                    </div>

                    {featuredCommunities.length === 0 ? (
                        <p className="text-slate-400 text-center py-8">No featured communities. Add from the list on the right.</p>
                    ) : (
                        <div className="space-y-3">
                            {featuredCommunities.map((comm, index) => (
                                <div key={comm._id} className="flex items-center gap-3 bg-slate-700 rounded-lg p-3">
                                    <div className="flex flex-col gap-1">
                                        <button
                                            onClick={() => moveUp(index)}
                                            disabled={index === 0}
                                            className="text-slate-400 hover:text-white disabled:opacity-30"
                                        >
                                            ▲
                                        </button>
                                        <button
                                            onClick={() => moveDown(index)}
                                            disabled={index === featuredCommunities.length - 1}
                                            className="text-slate-400 hover:text-white disabled:opacity-30"
                                        >
                                            ▼
                                        </button>
                                    </div>
                                    <span className="text-teal-400 font-bold w-6">{index + 1}</span>
                                    <div className="w-12 h-12 bg-slate-600 rounded-lg overflow-hidden flex-shrink-0">
                                        {(comm.coverImage || comm.profileImage) && (
                                            <img
                                                src={comm.coverImage || comm.profileImage}
                                                alt={getCommunityName(comm)}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">{getCommunityName(comm)}</p>
                                        <p className="text-slate-400 text-sm">{comm.membersCount || 0} members</p>
                                    </div>
                                    <button
                                        onClick={() => handleRemove(comm._id)}
                                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                                    >
                                        <FiX />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* All Communities */}
                <div className="bg-slate-800 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">All Communities</h2>

                    <div className="relative mb-4">
                        <IoIosSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search communities..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                        {loading ? (
                            <p className="text-slate-400 text-center py-8">Loading...</p>
                        ) : availableCommunities.length === 0 ? (
                            <p className="text-slate-400 text-center py-8">No communities available</p>
                        ) : (
                            availableCommunities.map((comm) => (
                                <div
                                    key={comm._id}
                                    className="flex items-center gap-3 bg-slate-700 rounded-lg p-3 hover:bg-slate-600 transition-colors"
                                >
                                    <div className="w-10 h-10 bg-slate-600 rounded-lg overflow-hidden flex-shrink-0">
                                        {(comm.coverImage || comm.profileImage) && (
                                            <img
                                                src={comm.coverImage || comm.profileImage}
                                                alt={getCommunityName(comm)}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">{getCommunityName(comm)}</p>
                                        <p className="text-slate-400 text-sm truncate">{comm.description?.slice(0, 50) || 'No description'}</p>
                                    </div>
                                    <button
                                        onClick={() => handleAdd(comm)}
                                        className="px-3 py-1 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 rounded-lg text-sm transition-colors"
                                    >
                                        + Add
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
