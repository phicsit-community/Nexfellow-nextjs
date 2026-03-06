import styles from "./ViewUserSkeleton.module.css";
import Skeleton from "../../components/ui/Skeleton/Skeleton";
import SkeletonPost from "../../components/Skeletons/SkeletonPost";


const ViewUserSkeleton = () => {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.layoutContainer}>
                <div className={styles.mainContentContainer}>
                    <div className={styles.mainContent}>
                        <div className={styles.backButtonContainer}>
                            <div className={styles.backButton}>
                                <div
                                    className={`${styles.skeleton} ${styles.skeletonButton}`}
                                ></div>
                            </div>
                            <div
                                className={`${styles.skeleton} ${styles.skeletonButton}`}
                            ></div>
                        </div>

                        <div className={styles.bannerSection}>
                            <div className={styles.bannerImgContainer}>
                                <div
                                    className={`${styles.skeleton} ${styles.skeletonBanner}`}
                                ></div>
                            </div>

                            <div className={styles.communityDetails}>
                                {/* <div className={styles.profileImageContainer}> */}
                                <div className={styles.profileImageWrapper}>
                                    <div
                                        className={`${styles.skeleton} ${styles.skeletonProfileImage}`}
                                    ></div>
                                </div>
                                {/* </div> */}

                                <div className={styles.communityHeader}>
                                    <div className={styles.communityNameContainer}>
                                        <div
                                            className={`${styles.skeleton} ${styles.skeletonTextLarge}`}
                                        ></div>
                                    </div>
                                </div>

                                <div
                                    className={`${styles.skeleton} ${styles.skeletonTextSmall}`}
                                ></div>
                                <div
                                    className={`${styles.skeleton} ${styles.skeletonDescription}`}
                                ></div>

                                <div className={styles.communityActions}>
                                    <div className={styles.members}>
                                        <div className={styles.memberImages}>
                                            {[1, 2, 3].map((i) => (
                                                <div
                                                    key={`avatar-${i}`}
                                                    className={`${styles.skeleton} ${styles.skeletonAvatar}`}
                                                ></div>
                                            ))}
                                        </div>
                                        <div
                                            className={`${styles.skeleton} ${styles.skeletonText}`}
                                            style={{ width: "100px" }}
                                        ></div>
                                    </div>

                                    <div className={styles.actionButtons}>
                                        {[1, 2, 3].map((i) => (
                                            <div
                                                key={`button-${i}`}
                                                className={`${styles.skeleton} ${styles.skeletonButton}`}
                                            ></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Skeleton for CommunityBody tabs */}
                    <div style={{ width: "100%", marginTop: "20px" }}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-evenly",
                                width: "100%",
                                borderBottom: "1px solid var(--skeleton-base)",
                            }}
                        >
                            <Skeleton
                                type="tab"
                                style={{ width: "80px", height: "32px", margin: "0 10px" }}
                            />
                            <Skeleton
                                type="tab"
                                style={{ width: "80px", height: "32px", margin: "0 10px" }}
                            />
                            <Skeleton
                                type="tab"
                                style={{ width: "80px", height: "32px", margin: "0 10px" }}
                            />
                        </div>

                        {/* Skeleton for posts */}
                        <>
                            <SkeletonPost />
                            <SkeletonPost />
                            <SkeletonPost />
                        </>
                    </div>
                </div>

                {/* Sidebar skeleton */}
                <div
                    className={`portrait:hidden ${styles.sidebar}`}
                    style={{
                        marginLeft: "50px",
                        marginTop: "0px",
                        width: "30%",
                        minWidth: "400px",
                    }}
                >
                    {[1, 2, 3].map((section) => (
                        <div
                            key={section}
                            className={styles.sidebarBlock}
                        >
                            {/* Sidebar title skeleton */}
                            <div className={styles.skeletonBlockTitle} />

                            {[1, 2, 3].map((item) => (
                                <div
                                    key={item}
                                    className={styles.sidebarSkeletonItem}
                                >
                                    {/* Avatar circle */}
                                    <div className={styles.skeletonCircle} />

                                    {/* Text lines */}
                                    <div className={styles.skeletonTextGroup}>
                                        <div className={styles.skeletonTextShort} />
                                        <div className={styles.skeletonTextLong} />
                                    </div>

                                    {/* Button rectangle */}
                                    <div className={styles.skeletonButton} />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ViewUserSkeleton;
