import React from "react";
import styles from "./Moderators.module.css";

const TransferModal = ({
    isOpen,
    onClose,
    onConfirm,
    followers,
    targetUser,
    onSelectTargetUser,
    currentUserId
}) => {
    if (!isOpen) return null;

    // Exclude current owner
    const eligibleUsers = followers.filter(user => user._id !== currentUserId);

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modal}>
                <h3 className={styles.modalTitle}>Transfer Ownership</h3>
                <p className={styles.modalText}>
                    Select a user to transfer ownership to:
                </p>

                <select
                    className={styles.actionDropdown}
                    value={targetUser?._id || ""}
                    onChange={(e) => {
                        const selected = followers.find(user => user._id === e.target.value);
                        onSelectTargetUser(selected || null);
                    }}
                >
                    <option value="" disabled>
                        -- Select Member --
                    </option>
                    {eligibleUsers.map((user) => (
                        <option key={user._id} value={user._id}>
                            {user.name} (@{user.username})
                        </option>
                    ))}
                </select>

                <div className={styles.modalButtons}>
                    <button className={styles.cancelButton} onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className={styles.promoteButton}
                        onClick={onConfirm}
                        disabled={!targetUser}
                    >
                        Confirm Transfer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransferModal;
