import { BrowserRouter, Route, Routes } from "react-router-dom";

// Pages
import Login from "./Pages/Login";
import Home from "./Pages/Home/Home";
import Lists from "./Pages/Lists/Lists";
import SendEmail from "./Pages/SendEmail/SendEmail";
import ViewEmails from "./Pages/ViewEmail/ViewEmails";
import EmailDetails from "./Pages/EmailDetails";
import Contacts from "./Pages/Contact/Contacts";

// Components
import ProtectedRoute from "./Components/ProtectedRoute";

// Layout
import Layout from "./Pages/Layout/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<ProtectedRoute element={Home} />} />
          <Route path="lists" element={<ProtectedRoute element={Lists} />} />
          <Route
            path="email/:id"
            element={<ProtectedRoute element={EmailDetails} />}
          />
          <Route
            path="send-email"
            element={<ProtectedRoute element={SendEmail} />}
          />
          <Route
            path="view-emails"
            element={<ProtectedRoute element={ViewEmails} />}
          />
          <Route
            path="contact"
            element={<ProtectedRoute element={Contacts} />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
