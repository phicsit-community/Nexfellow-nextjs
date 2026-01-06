import { useState } from "react";
import api from "../../lib/axios";
import styles from "./Moderators.module.css";
import { toast } from "sonner";
import { ROLE_OPTIONS, ROLE_PRIVILEGES } from "../Constants/roles";

const ModeratorCard = ({ user, communityId }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedRole, setSelectedRole] = useState(user.role);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.patch(`/community/${communityId}/role`, {
                userId: user._id,
                role: selectedRole,
                communityId: communityId,
            });
            toast.success(`Role updated to ${selectedRole}`);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to update role");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <img
                    src={user.picture || "/default-profile.jpg"}
                    alt={user.name}
                    className={styles.avatar}
                />
                <div>
                    <h4 className={styles.name}>{user.name}</h4>
                    <p className={styles.username}>@{user.username}</p>
                </div>
            </div>

            <div className={styles.roleSection}>
                <span className={styles.roleLabel}>Role:</span>
                {isEditing ? (
                    <select
                        className={styles.dropdown}
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        disabled={loading}
                    >
                        {ROLE_OPTIONS.map((role) => (
                            <option key={role.value} value={role.value}>
                                {role.label}
                            </option>
                        ))}
                    </select>
                ) : (
                    <span className={styles.memberTag}>
                        {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                    </span>
                )}
            </div>

            <div className={styles.privileges}>
                <span className={styles.privilegesTitle}>Privileges</span>
                <ul className={styles.privilegeList}>
                    {(ROLE_PRIVILEGES[selectedRole] || []).map((priv, i) => (
                        <li key={i} className={styles.privilegeTag}>
                            {priv}
                        </li>
                    ))}
                </ul>
            </div>

            <div className={styles.buttonGroup}>
                {isEditing ? (
                    <>
                        <button
                            onClick={handleSave}
                            className={styles.promoteButton}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className={styles.spinner}></span>
                            ) : (
                                "Save"
                            )}
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className={styles.cancelButton}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    <button onClick={() => setIsEditing(true)} className={styles.promoteButton}>
                        Change Role
                    </button>
                )}
            </div>
        </div>
    );
};

export default ModeratorCard;
