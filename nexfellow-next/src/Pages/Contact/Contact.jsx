"use client";

import Navbar from "@/components/Landing/Navbar/Navbar";
import ContactUs from "@/components/Landing/ContactUs/ContactUs";
import Footer from "@/components/Landing/Footer/Footer";

export default function Contact() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#071a2c", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ paddingTop: 96 }}>
        <ContactUs />
      </div>
      <Footer />
    </div>
  );
}
