import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./Pages/docs/HomePage";
import AccountSetup from "./Pages/docs/AccountSetup";
import VerificationPage from "./Pages/docs/Verification";
import Overview from "./Pages/docs/Overview";
import Post from "./Pages/docs/Post";
import Challenges from "./Pages/docs/Challenges";
import ContestSetup from "./Pages/docs/ContestSetup";
import LeaderBoard from "./Pages/docs/LeaderBoard";
import Community from "./Pages/docs/Community";
import Events from "./Pages/docs/Events";
import BroadcastPage from "./Pages/docs/Broadcast";
import BookMark from "./Pages/docs/BookMark";
import FeedPage from "./Pages/docs/FeedPage";
import FollowCommunity from "./Pages/docs/FollowCommunity";
import MembersAccessPage from "./Pages/docs/MembersAcessPage";
import Message from "./Pages/docs/Message";
import EditAccount from "./Pages/docs/EditAccount";
import MemberDiscussion from "./Pages/docs/MemberDiscussion";
import AccountSettings from "./Pages/docs/AccountSetting";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/account" element={<AccountSetup />} />
          <Route path="/verification" element={<VerificationPage />} />
          <Route path="/post" element={<Post />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/contestsetup" element={<ContestSetup />} />
          <Route path="/leaderboard" element={<LeaderBoard />} />
          <Route path="/community" element={<Community />} />
          <Route path="/events" element={<Events />} />
          <Route path="/broadcast" element={<BroadcastPage />} />
          <Route path="/bookmark" element={<BookMark />} />
          <Route path="/followCommunity" element={<FollowCommunity />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/membersaccess" element={<MembersAccessPage />} />
          <Route path="/message" element={<Message/>} />
          <Route path="/editProfile" element={<EditAccount />} />
          <Route path="/membersdiscussions" element={<MemberDiscussion />} />
          <Route path="/accountSettings" element={<AccountSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}
