"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useSelector } from "react-redux";

const ModeratorRoute = ({ children }) => {
    const params = useParams();
    const username = params?.username;
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [loading, setLoading] = useState(true);

    const currentUser = useSelector((state) => state.auth.user);
    const currentUserId = currentUser?.id || currentUser?._id || null;

    useEffect(() => {
        const checkModeratorStatus = async () => {
            if (!currentUserId) {
                setIsAuthorized(false);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const res = await axios.get(`/community/username/${username}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                    },
                });

                const community = res.data;
                const ownerId = community.owner?._id?.toString() || community.owner?.toString();
                const isOwner = ownerId === currentUserId;

                const modEntry = (community.moderators || []).find((mod) => {
                    const modUserId =
                        typeof mod.user === "string" ? mod.user : mod.user?._id?.toString();
                    return modUserId === currentUserId;
                });

                const allowedRoles = ["creator", "moderator", "content-admin", "event-admin", "analyst"];
                const userRole = isOwner ? "creator" : modEntry?.role || null;

                if (
                    currentUserId &&
                    (isOwner || (userRole && allowedRoles.includes(userRole)))
                ) {
                    setIsAuthorized(true);
                } else {
                    setIsAuthorized(false);
                }
            } catch (err) {
                console.error("Error checking moderator authorization:", err);
                setIsAuthorized(false);
            } finally {
                setLoading(false);
            }
        };

        checkModeratorStatus();
    }, [username, currentUserId]);

    useEffect(() => {
        if (isAuthorized === false && username) {
            router.replace(`/community/${username}`);
        }
    }, [isAuthorized, username, router]);

    if (isAuthorized === false) return null;

    if (isAuthorized) return <>{children}</>;

    return null;
};

export default ModeratorRoute;
