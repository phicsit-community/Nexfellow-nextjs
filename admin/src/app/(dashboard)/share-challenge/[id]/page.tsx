'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiX, FiCopy, FiExternalLink } from 'react-icons/fi';
import { FaTwitter, FaLinkedin, FaWhatsapp, FaFacebook } from 'react-icons/fa';
import { toast } from 'sonner';

export default function ShareChallengePage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    // Mock data
    const challenge = {
        name: '7-Day Fitness Challenge',
        startDate: '20 January',
        endDate: '27 January',
        price: 'Free',
        imageUrl: '',
    };

    const shareUrl = `https://nexfellow.com/challenges/${id}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
    };

    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Join the ${challenge.name}!`)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this challenge: ${shareUrl}`)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    };

    return (
        <div className="min-h-screen p-6 flex items-center justify-center">
            <div className="bg-slate-800 rounded-xl max-w-md w-full p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">Share Challenge</h2>
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <FiX className="text-slate-400" />
                    </button>
                </div>

                {/* Challenge Preview */}
                <div className="flex gap-4 mb-6 p-4 bg-slate-700 rounded-lg">
                    <div className="w-20 h-20 bg-gradient-to-br from-teal-500/30 to-purple-500/30 rounded-lg flex items-center justify-center text-3xl">
                        🏆
                    </div>
                    <div className="flex-1">
                        <h3 className="text-white font-medium">{challenge.name}</h3>
                        <p className="text-slate-400 text-sm">
                            {challenge.startDate} - {challenge.endDate}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                            {challenge.price}
                        </span>
                    </div>
                </div>

                {/* Share Buttons */}
                <div className="mb-6">
                    <p className="text-slate-400 text-sm mb-3">Share on social media</p>
                    <div className="flex justify-center gap-4">
                        <a
                            href={shareLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center transition-colors"
                        >
                            <FaTwitter className="text-xl text-slate-300" />
                        </a>
                        <a
                            href={shareLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center transition-colors"
                        >
                            <FaLinkedin className="text-xl text-slate-300" />
                        </a>
                        <a
                            href={shareLinks.whatsapp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center transition-colors"
                        >
                            <FaWhatsapp className="text-xl text-slate-300" />
                        </a>
                        <a
                            href={shareLinks.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center transition-colors"
                        >
                            <FaFacebook className="text-xl text-slate-300" />
                        </a>
                    </div>
                </div>

                {/* Link Section */}
                <div>
                    <p className="text-slate-400 text-sm mb-2">Challenge page link</p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={shareUrl}
                            readOnly
                            className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-300 text-sm"
                        />
                        <button
                            onClick={handleCopyLink}
                            className="px-4 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
                        >
                            <FiCopy />
                        </button>
                    </div>
                </div>

                {/* Open Link */}
                <a
                    href={shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 mt-4 text-teal-400 hover:text-teal-300 text-sm transition-colors"
                >
                    <FiExternalLink /> Open challenge page
                </a>
            </div>
        </div>
    );
}
