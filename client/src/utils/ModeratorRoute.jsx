import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

const ModeratorRoute = ({ children }) => {
    const { username } = useParams();
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

    if (isAuthorized === false) return <Navigate to={`/community/${username}`} replace />;

    if (isAuthorized) return <>{children}</>;

    return null;
};

export default ModeratorRoute;
