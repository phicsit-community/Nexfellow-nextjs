// src/hooks/useProfileRedirect.js
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "../lib/axios";

export default function useProfileRedirect() {
    const router = useRouter();

    return useCallback(
        async (user, options = {}) => {
            if (!user) {
                console.warn("useProfileRedirect called with no user");
                return;
            }

            // Ensure we have a user identifier
            const userIdOrUsername = user.username || user._id;
            if (!userIdOrUsername) {
                console.error("User has no identifier for redirect");
                return;
            }

            let finalUser = user;

            // If required fields are missing, fetch them
            const needsFetch =
                user.isCommunityAccount === undefined ||
                user.createdCommunity === undefined;

            if (needsFetch) {
                try {
                    const res = await api.get(`/user/profile/username/${userIdOrUsername}`);

                    // If the server explicitly asks the client to redirect, follow it
                    if (res?.data?.redirect) {
                        // if server gives absolute path or full url, use it directly
                        const redirectPath = res.data.redirect;
                        // close over options if you want replace behavior
                        const { replace = false } = options;
                        if (replace) {
                            router.replace(redirectPath);
                        } else {
                            router.push(redirectPath);
                        }
                        return;
                    }

                    // Try multiple fallbacks: res.data.user, res.data (sometimes API returns user directly)
                    finalUser = res?.data?.user ?? res?.data ?? finalUser;

                    // If finalUser is still missing expected flags, log for debugging
                    if (
                        finalUser &&
                        (finalUser.isCommunityAccount === undefined ||
                            finalUser.createdCommunity === undefined)
                    ) {
                        console.debug(
                            "useProfileRedirect: fetched user incomplete, proceeding with what we have:",
                            finalUser
                        );
                    }
                } catch (error) {
                    console.error("Failed to fetch full user details:", error);
                    // continue with the original user object (best-effort)
                    finalUser = finalUser || user;
                }
            }

            // Normalize fields (safe even if finalUser is undefined-ish)
            const isCommunityAccount = !!(finalUser && finalUser.isCommunityAccount);
            const createdCommunity = !!(finalUser && finalUser.createdCommunity);

            const username = encodeURIComponent(String(finalUser?.username || finalUser?._id || userIdOrUsername));

            // Decide the final route
            const path =
                isCommunityAccount && createdCommunity
                    ? `/explore/${username}`
                    : `/user/${username}`;

            const { replace = false } = options;
            if (replace) {
                router.replace(path);
            } else {
                router.push(path);
            }
        },
        [router]
    );
}

