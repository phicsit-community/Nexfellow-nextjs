import { useEffect, useState, useMemo } from "react";
import api from "../../lib/axios";
import GetMoreWithGCCommunity from "../../components/Blog/GetMoreWithGCCommunity/GetMoreWithGCCommunity";
import style from "./Blog.module.css";
import Footer from "../../components/Landing/Footer/Footer";
import ContactCTA from "../../components/Landing/ContactCTA/ContactCTA";
import BlogSection from "../../components/Blog/BlogSection/BlogSection";
import Navbar from "../../components/Landing/Navbar/Navbar";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    axios
      .get("/blogs")
      .then((res) => {
        // Handle both { blogs: [...] } and direct [...] response formats
        const blogsData = Array.isArray(res.data) ? res.data : (res.data?.blogs || []);
        setBlogs(blogsData);
        setLoading(false);
      })
      .catch(() => {
        // Handle error appropriately
        console.error("Failed to fetch blogs");
        setBlogs([]);
        setLoading(false);
      });
  }, []);

  // Filter blogs by active category
  const filteredBlogs = useMemo(() => {
    if (activeCategory === "All") return blogs;
    return blogs.filter((b) => b.category === activeCategory);
  }, [blogs, activeCategory]);

  return (
    <div className={style.blog}>
      <Navbar />
      <div className={style.container}>
        <GetMoreWithGCCommunity
          blogs={blogs}
          loading={loading}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
        <BlogSection blogs={filteredBlogs} loading={loading} />
        <ContactCTA />
        <Footer />
      </div>
    </div>
  );
};

export default Blog;
