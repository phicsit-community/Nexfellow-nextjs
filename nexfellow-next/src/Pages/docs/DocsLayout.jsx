import { Outlet } from "react-router-dom";
import Layout from "./components/Layout";

export default function DocsLayout() {
  return (
    <Layout isPrivate={false}>
      <Outlet />
    </Layout>
  );
}
