import { Route } from "react-router-dom";
import DocsLayout from "../Pages/docs/DocsLayout";

// docs pages
import HomePage from "../Pages/docs/Pages/HomePage";
import Overview from "../Pages/docs/Pages/Overview";
import AccountSetup from "../Pages/docs/Pages/AccountSetup";
import VerificationPage from "../Pages/docs/Pages/Verification";
import Post from "../Pages/docs/Pages/Post";
import Challenges from "../Pages/docs/Pages/Challenges";
import ContestSetup from "../Pages/docs/Pages/ContestSetup";
import LeaderBoard from "../Pages/docs/Pages/LeaderBoard";
import Community from "../Pages/docs/Pages/Community";
import Events from "../Pages/docs/Pages/Events";
import BroadcastPage from "../Pages/docs/Pages/Broadcast";
import BookMark from "../Pages/docs/Pages/BookMark";
import FeedPage from "../Pages/docs/Pages/FeedPage";
import FollowCommunity from "../Pages/docs/Pages/FollowCommunity";
import MembersAccessPage from "../Pages/docs/Pages/MembersAcessPage";
import Message from "../Pages/docs/Pages/Message";
import EditAccount from "../Pages/docs/Pages/EditAccount";
import MemberDiscussion from "../Pages/docs/Pages/MemberDiscussion";
import AccountSettings from "../Pages/docs/Pages/AccountSetting";

// 👇 EXPORT A ROUTE ELEMENT (NOT A COMPONENT)
export const docsRoutes = (
    <Route path="/docs" element={<DocsLayout />}>
        <Route index element={<HomePage />} />
        <Route path="overview" element={<Overview />} />
        <Route path="account" element={<AccountSetup />} />
        <Route path="verification" element={<VerificationPage />} />
        <Route path="post" element={<Post />} />
        <Route path="challenges" element={<Challenges />} />
        <Route path="contestsetup" element={<ContestSetup />} />
        <Route path="leaderboard" element={<LeaderBoard />} />
        <Route path="community" element={<Community />} />
        <Route path="events" element={<Events />} />
        <Route path="broadcast" element={<BroadcastPage />} />
        <Route path="bookmark" element={<BookMark />} />
        <Route path="follow-community" element={<FollowCommunity />} />
        <Route path="feed" element={<FeedPage />} />
        <Route path="membersaccess" element={<MembersAccessPage />} />
        <Route path="message" element={<Message />} />
        <Route path="edit-profile" element={<EditAccount />} />
        <Route path="membersdiscussions" element={<MemberDiscussion />} />
        <Route path="account-settings" element={<AccountSettings />} />
    </Route>
);
