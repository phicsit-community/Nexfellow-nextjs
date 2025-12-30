import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.scss";
import { Toaster } from "sonner";

// pages
import Home from "./Pages/Home/Home";
import Quiz from "./Pages/Quiz/Quiz";
import CreateQuiz from "./Pages/CreateQuiz/CreateQuiz";
import Edit from "./Pages/Edit/Edit";
import Login from "./Pages/Login/Login";
import Users from "./Pages/Users/Users";
import CreateChallenge from "./Pages/CreateChallenge/CreateChallenge";
import AddRewards from "./Pages/AddRewards/AddRewards";
import CreateReward from "./Pages/CreateReward/CreateReward";
import CheckoutDetails from "./Pages/CheckoutDetails/CheckoutDetails";
import ShareChallenge from "./Pages/ShareChallenge/ShareChallenge";
import Referrals from "./Pages/Referrals/Referrals";
import Challenge from "./Pages/Challenge/Challenge";
import Overview from "./Pages/Challenge/Overview";
import Checkpoint from "./Pages/Challenge/Checkpoint";
import Participants from "./Pages/Challenge/Participants";
import Requets from "./Pages/Requests/Requests";
import Advertisements from "./Pages/Advertisements/Advertisements";
import FeaturedCommunities from "./Pages/FeaturedCommunities/FeaturedCommunities";
import Notifications from "./Pages/Notifications/Notifications";
import Posts from "./Pages/Posts/Posts";
import Analytics from "./Pages/Analytics/Analytics";
import BlogPage from "./Pages/BlogPage/BlogPage";


// components
import ProtectedRoute from "./Components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-right" richColors />
      <Routes>
        <Route path="/" element={<ProtectedRoute element={Users} />} />
        {/* <Route path="/quiz/:id" element={<ProtectedRoute element={Quiz} />} />

        <Route
          path="/create-challenge"
          element={<ProtectedRoute element={CreateChallenge} />}
        />
        <Route
          path="/challenge"
          element={<ProtectedRoute element={Challenge} />}
        >
          <Route path="overview" element={<Overview />} />
          <Route path="checkpoints" element={<Checkpoint />} />
          <Route path="participants" element={<Participants />} />
        </Route> */}

        <Route
          path="/checkout-details"
          element={<ProtectedRoute element={CheckoutDetails} />}
        />
        {/* <Route
          path="/share-challenge"
          element={<ProtectedRoute element={ShareChallenge} />}
        />
        <Route
          path="/create-quiz"
          element={<ProtectedRoute element={CreateQuiz} />}
        />

        <Route
          path="/create-reward"
          element={<ProtectedRoute element={CreateReward} />}
        /> */}

        <Route
          path="/referrals"
          element={<ProtectedRoute element={Referrals} />}
        />

        {/* <Route
          path="/add-rewards/:quizId"
          element={<ProtectedRoute element={AddRewards} />}
        />

        <Route
          path="/quiz/edit/:id"
          element={<ProtectedRoute element={Edit} />}
        /> */}

        <Route path="/users" element={<ProtectedRoute element={Users} />} />

        <Route path="/blogs" element={<ProtectedRoute element={BlogPage} />} />

        <Route path="/notifications" element={<ProtectedRoute element={Notifications} />} />

        <Route path="/analytics" element={<ProtectedRoute element={Analytics} />} />

        <Route path="/posts" element={<ProtectedRoute element={Posts} />} />

        <Route path="/requests" element={<ProtectedRoute element={Requets} />} />

        <Route path="/advertisements" element={<ProtectedRoute element={Advertisements} />} />

        <Route path="/featured-communities" element={<ProtectedRoute element={FeaturedCommunities} />} />

        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
