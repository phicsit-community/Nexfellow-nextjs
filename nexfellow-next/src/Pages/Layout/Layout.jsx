import { Outlet, useLocation } from "react-router-dom";
import clsx from "clsx";

// components
import Navbar from "../../components/Navbar/Navbar";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import ViewOnlyHeader from "../ViewOnly/ViewOnlyHeader";

// style
import style from "./Layout.module.css";

const Layout = ({ isPrivate = false }) => {
  const location = useLocation();

  // Route patterns for view-only pages
  const VIEW_ONLY_ROUTES = [
    "/explore/:username",
    "/community/:username",
    "/dashboard/:username",
    "/challenge/:id",
    "/community/events/:eventId",
    "/quiz/:id",
    "/user/:username",
    "/community/contests/:id",
  ];
  const isViewOnlyRoute = VIEW_ONLY_ROUTES.some((route) => {
    const regex = new RegExp(`^${route.replace(/:[^/]+/g, "[^/]+")}$`);
    return regex.test(location.pathname);
  });

  // Auth check
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  // Sidebar and header hiding logic (unchanged)
  const HIDE_SIDEBAR_ROUTES = ["/post/:postId", "/contest-question/:id"];
  const shouldHideSidebar = HIDE_SIDEBAR_ROUTES.some((route) => {
    const regex = new RegExp(`^${route.replace(/:[^/]+/g, "[^/]+")}$`);
    return regex.test(location.pathname);
  });

  const HIDE_HEADER_ROUTES = ["/contest-question/:id"];
  const shouldHideHeader = HIDE_HEADER_ROUTES.some((route) => {
    const regex = new RegExp(`^${route.replace(/:[^/]+/g, "[^/]+")}$`);
    return regex.test(location.pathname);
  });

  const HIDE_NAVBAR_ROUTES = [
    "/",
    "/blogs",
    "/blogs/:id",
    "/overview",
    "/contact",
    "/privacy",
    "/terms",
    "/help",
    "/mission",
    "/login",
    "/signup",
    "/forgotpassword",
  ];
  const shouldHideNavbar = HIDE_NAVBAR_ROUTES.some((route) => {
    const regex = new RegExp(`^${route.replace(/:[^/]+/g, "[^/]+")}$`);
    return regex.test(location.pathname);
  });

  return (
    <div
      className={clsx(style.container, {
        [style.wideContainer]: [
          "/",
          "/blogs",
          "/blogs/:id",
          "/overview",
          "/login",
          "/signup",
          "/privacy",
          "/terms",
          "/help",
          "/forgotpassword",
          "/contact",
          "/mission",
        ].includes(location.pathname),
      })}
    >
      {/* Show ViewOnlyHeader ONLY for view-only routes and when NOT logged in */}
      {!isLoggedIn && isViewOnlyRoute ? (
        <ViewOnlyHeader />
      ) : isPrivate ? (
        !shouldHideHeader && <Header />
      ) : !shouldHideNavbar ? (
        <Navbar />
      ) : null}

      {/* Main layout logic */}
      {isPrivate && isLoggedIn ? (
        <div className={style.main}>
          {!shouldHideSidebar && (
            <div className={style.sidebar}>
              <Sidebar />
            </div>
          )}
          <div className={style.content}>
            <Outlet />
          </div>
        </div>
      ) : (
        !isPrivate && <Outlet />
      )}
    </div>
  );
};

export default Layout;
