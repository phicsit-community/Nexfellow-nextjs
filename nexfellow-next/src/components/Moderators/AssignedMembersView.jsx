import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Moderators.module.css";
import ModeratorCard from "./ModeratorCard";
import TransferModal from "./TransferModal";
import { ROLE_OPTIONS, ROLE_PRIVILEGES } from "../Constants/roles";

const AssignedMembersView = ({ communityId }) => {
    const [owner, setOwner] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null); // ✅ Added

    useEffect(() => {
        const fetchModerators = async () => {
            try {
                const res = await axios.get(`/community/id/${communityId}`);
                const community = res.data.community;

                let users = community.owner.followers || [];

                if (!users.some(u => u._id === community.owner._id)) {
                    users = [community.owner, ...users];
                }

                const userIds = users.map(u => u._id);
                const { data } = await axios.post(`/community/${communityId}/get-users-roles`, {
                    communityId,
                    userIds,
                });

                const fetchedOwner = data.owner;
                let restUsers = data.users;

                // Filter only users with assigned roles (excluding normal members)
                restUsers = restUsers.filter(
                    (user) =>
                        user.role &&
                        user.role.toLowerCase() !== "member" &&
                        user.role.toLowerCase() !== ""
                );

                setOwner(fetchedOwner);
                setMembers(restUsers);
            } catch (error) {
                console.error("Error loading roles", error);
            } finally {
                setLoading(false);
            }
        };

        fetchModerators();
    }, [communityId]);

    const handleConfirmTransfer = async () => {
        if (!selectedUser) return;

        try {
            await axios.patch(`/community/${communityId}/transfer-ownership`, {
                newOwnerId: selectedUser._id,
            });

            alert("Ownership transferred successfully");
            window.location.reload();
        } catch (err) {
            console.error("Transfer failed", err);
            alert("Ownership transfer failed");
        }
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;

    return (
        <div className={styles.grid}>
            {owner && (
                <div className={`${styles.card} ${styles.ownerCard}`}>
                    <div className={styles.cardHeader}>
                        <img
                            src={owner.picture || "/default-profile.jpg"}
                            alt={owner.name}
                            className={styles.avatar}
                        />
                        <div>
                            <h4 className={styles.name}>
                                {owner.name}
                                <span className={styles.ownerTag}>Owner</span>
                            </h4>
                            <p className={styles.username}>@{owner.username}</p>
                        </div>
                    </div>

                    <div className={styles.roleSection}>
                        <span className={styles.roleLabel}>Role:</span>
                        <span className={styles.memberTag}>Owner</span>
                    </div>

                    <div className={styles.privileges}>
                        <span className={styles.privilegesTitle}>Privileges</span>
                        <ul className={styles.privilegeList}>
                            {ROLE_PRIVILEGES["owner"].map((priv, i) => (
                                <li key={i} className={styles.privilegeTag}>
                                    {priv}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button
                        onClick={() => {
                            setSelectedUser(null); // clear previous
                            setShowTransferModal(true);
                        }}
                        className={styles.transferButton}
                    >
                        Transfer Ownership
                    </button>
                </div>
            )}

            {members.map((user) => (
                <ModeratorCard key={user._id} user={user} communityId={communityId} />
            ))}

            <TransferModal
                isOpen={showTransferModal}
                onClose={() => {
                    setSelectedUser(null);
                    setShowTransferModal(false);
                }}
                followers={members}
                targetUser={selectedUser}
                onSelectTargetUser={setSelectedUser}
                onConfirm={handleConfirmTransfer}
                currentUserId={owner?._id}
            />
        </div>
    );
};

export default AssignedMembersView;
