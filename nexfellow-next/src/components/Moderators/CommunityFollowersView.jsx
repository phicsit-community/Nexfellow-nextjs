import React, { useEffect, useState } from "react";
import api from "../../lib/axios";
import styles from "./Moderators.module.css";
import TransferModal from "./TransferModal";
import { toast } from "sonner";
import { Crown, ShieldCheck, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { ROLE_OPTIONS } from "../Constants/roles";

const normalizeRole = (role) => {
    if (!role) return "Member";
    const roleMap = ROLE_OPTIONS.reduce((acc, { label, value }) => {
        acc[value] = label;
        return acc;
    }, {});
    return roleMap[role.toLowerCase()] || "Member";
};

const CommunityFollowersView = ({ communityId }) => {
    const [followers, setFollowers] = useState([]);
    const [owner, setOwner] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Loading state for individual role updates, keyed by userId
    const [roleLoadingMap, setRoleLoadingMap] = useState({});

    // Loading state for ownership transfer
    const [transferLoading, setTransferLoading] = useState(false);

    const currentUser = useSelector((state) => state.auth.user);
    const currentUserId = currentUser?.id;

    const fetchData = async () => {
        try {
            const communityRes = await api.get(`/community/id/${communityId}`);
            const community = communityRes.data.community;
            const ownerId = community.owner._id;

            const followersRes = await api.get(`/community/followers/${communityId}`);
            const rawFollowers = followersRes.data.followers;

            const userIds = rawFollowers.map((u) => u._id);
            const rolesRes = await api.post(`/community/${communityId}/get-users-roles`, {
                communityId,
                userIds,
            });

            const enrichedFollowers = rawFollowers.map((follower) => {
                const foundUser = rolesRes.data.users.find((u) => u._id === follower._id);
                const role =
                    follower._id === ownerId
                        ? "Owner"
                        : normalizeRole(foundUser?.role);
                return { ...follower, role };
            });

            setOwner(community.owner);
            setFollowers(enrichedFollowers);
        } catch (err) {
            toast.error("Failed to load followers or roles");
            console.error(err);
        }
    };

    useEffect(() => {
        if (communityId) fetchData();
        // eslint-disable-next-line
    }, [communityId]);

    const handleRoleChange = async (userId, newRole) => {
        setRoleLoadingMap((prev) => ({ ...prev, [userId]: true }));
        try {
            await api.patch(`/community/${communityId}/role`, {
                userId,
                role: newRole,
                communityId,
            });
            toast.success(`Role updated to ${newRole}`);
            await fetchData();
        } catch (err) {
            toast.error("Failed to update role");
            console.error(err);
        } finally {
            setRoleLoadingMap((prev) => ({ ...prev, [userId]: false }));
        }
    };

    const handleOwnershipTransfer = async () => {
        setTransferLoading(true);
        try {
            await api.patch(`/api/community/${communityId}/moderators`, {
                userId: selectedUser._id,
                action: "transferOwnership",
            });
            toast.success("Ownership transferred");
            setShowModal(false);
            setSelectedUser(null);
            await fetchData();
        } catch (err) {
            toast.error("Transfer failed");
            console.error(err);
        } finally {
            setTransferLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Member</th>
                            <th>Account Created</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {followers.map((user) => {
                            const isOwner = user.role === "Owner";
                            const isSelf = user._id === currentUserId;
                            const isCurrentOwner = owner?._id === currentUserId;
                            const followedDate = new Date(user.followedAt || user.createdAt).toLocaleDateString();

                            const roleLoading = !!roleLoadingMap[user._id];

                            return (
                                <tr key={user._id}>
                                    <td className={styles.userCell}>
                                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "16px" }}>
                                            <div>
                                                <img
                                                    src={user.picture || "/default.jpg"}
                                                    className={styles.avatar}
                                                    alt="User"
                                                />
                                            </div>
                                            <div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <span className={styles.name}>{user.name}</span>
                                                    {isOwner && (
                                                        <span className={styles.roleTag}>
                                                            <Crown size={15} style={{ verticalAlign: "middle" }} /> Owner
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={styles.username}>@{user.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.date}>{followedDate}</td>
                                    <td className={styles.actions}>
                                        {isOwner && isSelf && isCurrentOwner ? (
                                            <button
                                                className={styles.transferBtn}
                                                onClick={() => {
                                                    setSelectedUser(null);
                                                    setShowModal(true);
                                                }}
                                                disabled={transferLoading}
                                            >
                                                {transferLoading ? (
                                                    <Loader2 className={styles.spinner} />
                                                ) : (
                                                    <>
                                                        <ShieldCheck size={16} style={{ marginTop: -2, marginRight: 6 }} /> Transfer
                                                    </>
                                                )}
                                            </button>
                                        ) : isOwner ? (
                                            <span className={styles.noAction}>—</span>
                                        ) : roleLoading ? (
                                            <Loader2 className={styles.spinner} />
                                        ) : (
                                            <select
                                                className={styles.actionDropdown}
                                                value={ROLE_OPTIONS.find((r) => r.label === user.role)?.value || "member"}
                                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                disabled={roleLoading}
                                            >
                                                {ROLE_OPTIONS.map(({ label, value }) => (
                                                    <option key={value} value={value}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <TransferModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setSelectedUser(null);
                }}
                onConfirm={handleOwnershipTransfer}
                followers={followers}
                targetUser={selectedUser}
                onSelectTargetUser={setSelectedUser}
                currentUserId={currentUserId}
            />
        </div>
    );
};

export default CommunityFollowersView;
