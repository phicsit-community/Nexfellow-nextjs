import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";

// utils
import PrivateRoutes from "./utils/PrivateRoutes";
import ModeratorRoute from "./utils/ModeratorRoute";

// loader
import Loader from "./components/Loader/Loader";

// layout
import Layout from "./Pages/Layout/Layout";

// Link Stats component
import LinkStats from "./components/LinkStats/LinkStats";

// Error Boundary
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";

// public pages - lazy loaded
const Home = lazy(() => import("./Pages/Home/Home"));
const Login = lazy(() => import("./Pages/Auth/Login/Login"));
const Signup = lazy(() => import("./Pages/Auth/Signup/Signup"));
const Blog = lazy(() => import("./Pages/Blog/Blog"));
const Contact = lazy(() => import("./Pages/Contact/Contact"));
const Privacy = lazy(() => import("./Pages/Privacy/Privacy.jsx"));
const Terms = lazy(() => import("./Pages/Terms/Terms.jsx"));

const ForgotPassword = lazy(() =>
  import("./Pages/Auth/ForgotPassword/ForgotPassword")
);
const SecurePage = lazy(() => import("./utils/SecurePage.jsx"));
const Mission = lazy(() => import("./Pages/Mission/Mission"));
const ViewOnlyChallenge = lazy(() =>
  import("./Pages/ViewOnly/ViewOnlyChallenge.jsx")
);
const ViewOnlyEvent = lazy(() => import("./Pages/ViewOnly/ViewOnlyEvent.jsx"));
const ViewOnlyQuiz = lazy(() => import("./Pages/ViewOnly/ViewOnlyQuiz.jsx"));
const ViewOnlyUser = lazy(() => import("./Pages/ViewOnly/ViewOnlyUser.jsx"));
const ViewOnlyExplore = lazy(() =>
  import("./Pages/ViewOnly/ViewOnlyExplore.jsx")
);
const ViewOnlyContestDetails = lazy(() =>
  import("./Pages/ViewOnly/ViewOnlyContestDetails.jsx")
);
import { InternalBlogPage } from "./Pages/Blog/InternalBlogPage/InternalBlogPage.jsx";

// private pages (eagerly loaded)
import FeedPage from "./Pages/FeedPage/FeedPage";
import Explore from "./Pages/Explore/Explore";
import PostFullScreen from "./Pages/PostPage/PostFullScreen";
import Leaderboard from "./Pages/Leaderboard/Leaderboard";
import ViewCommunity from "./Pages/Community/ViewCommunity";
import ModeratorsView from "./Pages/Moderators/ModeratorsView";
import CreateChallenge from "./Pages/Community/CreateChallenge";
import CreateEvent from "./Pages/Event/Event";
import DashboardEventDetails from "./Pages/Event/DashboardEventDetails";
import EventDetails from "./Pages/Event/EventDetails";
import CreateContests from "./Pages/DashboardContest/Contests";
import EditQuiz from "./components/EditQuizForm/EditQuizForm.jsx";
import CreateQuiz from "./components/QuizForm/QuizForm.jsx";
import Quiz from "./Pages/DashboardContest/Quiz.jsx";
import Allcontest from "./Pages/AllContest/Allcontest.jsx";
import AllContestList from "./Pages/AllContest/AllContestList.jsx";
import NotificationPage from "./Pages/Notification/NotificationPage";
import NotificationReadPage from "./Pages/Notification/NotificationReadPage";
import SingleChallenge from "./Pages/Community/SingleChallenge";
import AdminChallengeDashboard from "./Pages/Community/AdminChallengeDashboard";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Broadcast from "./Pages/Broadcast/Broadcast";
import AllCommunities from "./Pages/Community/AllCommunities";
import Community from "./Pages/Community/Community";
import EditProfile from "./Pages/Dashboard/EditProfileForm";
import CreateCommunityAccount from "./Pages/Dashboard/CommunityForm";
import ContestDetails from "./Pages/Contests/ContestDetails.jsx";
import ContestQuestion from "./Pages/ContestQuestion/Contestquestion";
import StartContestPage from "./components/Contest/StartContestPage";
import ContestCompletedPage from "./components/Contest/ContestCompletedPage";
import Inbox from "./Pages/Inbox/Inbox";
import SearchResults from "./Pages/SearchResults/SearchResults";
import CommingSoon from "./Pages/CommingSoon/CommingSoon";
import ViewUser from "./Pages/User/ViewUser";
import TopMembers from "./Pages/TopMembers/TopMembers";
import Moderators from "./Pages/Moderators/Moderators";
import Settings from "./Pages/Settings/Settings";
import NotFound from "./Pages/NotFound/NotFound.jsx";
import { docsRoutes } from "./routes/DocsRoutes.jsx";

const AppRoutes = () => {
  const { isAuthLoading, isLoggedIn, user } = useSelector(
    (state) => state.auth
  );
  const isAuthenticated = isLoggedIn && !!user;

  // if (isAuthLoading) {
  //   return <Loader />;
  // }

  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<Layout isPrivate={false} />}>
            <Route path="/" element={<Home />} />
            <Route path="/blogs" element={<Blog />} />
            <Route path="/blogs/:id" element={<InternalBlogPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/secure/:token" element={<SecurePage />} />
            <Route path="/mission" element={<Mission />} />
            <Route path="/help" element={<CommingSoon />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/link/:shortCode" element={<LinkStats />} />
          </Route>

          {/* Conditional routes for non-authenticated users */}
          {!isAuthenticated ? (
            <Route element={<Layout isPrivate={false} />}>
              <Route path="/explore/:username" element={<ViewOnlyExplore />} />
              <Route
                path="/community/:username"
                element={<ViewOnlyExplore />}
              />
              {/* <Route
                path="/dashboard/:username"
                element={<ViewOnlyExplore />}
              /> */}
              <Route path="/challenge/:id" element={<ViewOnlyChallenge />} />
              <Route
                path="/community/events/:eventId"
                element={<ViewOnlyEvent />}
              />
              <Route path="/contest/:id" element={<ViewOnlyQuiz />} />
              <Route path="/user/:username" element={<ViewOnlyUser />} />
              <Route
                path="/community/contests/:id"
                element={<ViewOnlyContestDetails />}
              />
            </Route>
          ) : (
            <Route element={<PrivateRoutes />}>
              <Route element={<Layout isPrivate={true} />}>
                <Route path="/explore/:username" element={<ViewCommunity />} />
                <Route
                  path="/community/:username"
                  element={<ViewCommunity />}
                />
                <Route
                  path="/moderators/:username"
                  element={
                    <ModeratorRoute>
                      <ModeratorsView isModeratorView={true} />
                    </ModeratorRoute>
                  }
                />
                <Route path="/challenge/:id" element={<SingleChallenge />} />
                <Route
                  path="/community/events/:eventId"
                  element={<EventDetails />}
                />
                <Route path="/contest/:id" element={<Quiz />} />
                <Route path="/user/:username" element={<ViewUser />} />
                <Route
                  path="/community/contests/:id"
                  element={<ContestDetails />}
                />
                <Route
                  path="/community/admin-dashboard/:communityId"
                  element={<AdminChallengeDashboard />}
                />
              </Route>
            </Route>
          )}

          {docsRoutes}

          {/* Private Routes */}
          <Route element={<PrivateRoutes />}>
            <Route element={<Layout isPrivate={true} />}>
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/post/:postId" element={<PostFullScreen />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/communities" element={<Community />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route
                path="/create/challenges/:communityId"
                element={<CreateChallenge />}
              />
              {/* Uncomment if you want these routes */}
              {/* <Route path="/contests" element={<Allcontest />} /> */}
              {/* <Route path="/contests/:type" element={<AllContestList />} /> */}
              <Route
                path="/start-contest/:quizId"
                element={<StartContestPage />}
              />
              <Route
                path="/contest-completed/:quizId"
                element={<ContestCompletedPage />}
              />
              <Route
                path="/contest-question/:id"
                element={<ContestQuestion />}
              />
              <Route
                path="/create/events/:communityId"
                element={<CreateEvent />}
              />
              <Route
                path="/create/events/details/:eventId"
                element={<DashboardEventDetails />}
              />
              <Route
                path="/create/contests/:communityId"
                element={<CreateContests />}
              />
              <Route
                path="/create-contest/:communityId"
                element={<CreateQuiz />}
              />
              <Route path="/contest/edit/:id" element={<EditQuiz />} />
              <Route path="/notifications" element={<NotificationPage />} />
              <Route
                path="/notifications/:id"
                element={<NotificationReadPage />}
              />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/:username" element={<Dashboard />} />
              <Route
                path="/admin/challenge/:id"
                element={<AdminChallengeDashboard />}
              />
              <Route
                path="/communication/broadcast/:communityId"
                element={<Broadcast />}
              />
              <Route
                path="/community/all-communities"
                element={<AllCommunities />}
              />
              <Route path="/edit-profile/:username" element={<EditProfile />} />
              <Route
                path="/verification/:username"
                element={<CreateCommunityAccount />}
              />
              <Route
                path="/other/topmembers/:communityId"
                element={<TopMembers />}
              />
              <Route
                path="/other/moderators/:communityId"
                element={<Moderators />}
              />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/inbox/:username" element={<Inbox />} />

              <Route path="/settings" element={<Settings />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/coming-soon" element={<CommingSoon />} />
            </Route>
          </Route>

          {/* Fallback Route */}
          <Route path="/*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default AppRoutes;
