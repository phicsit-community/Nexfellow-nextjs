"use client";

import { useState } from "react";
import { Zap, MessageSquareText, Heart, Clock, Globe, ArrowRight, Send } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import styles from "./ContactUs.module.css";

const INITIAL = { firstName: "", lastName: "", email: "", phoneNumber: "", subject: "", message: "" };

const FEATURES = [
  { icon: Zap, title: "Fast Response", text: "We reply within 24 hrs" },
  { icon: MessageSquareText, title: "Real People", text: "Talk to our team" },
  { icon: Heart, title: "Builder First", text: "We care about you" },
];

const INFO = [
  { icon: Clock, label: "Office Hours", title: "09:00 AM – 06:00 PM", text: "Monday to Friday" },
  { icon: Globe, label: "We're Global", title: "Remote first, worldwide", text: "Proudly serving builders everywhere." },
];

export default function ContactUs() {
  const [form, setForm] = useState(INITIAL);
  const [sending, setSending] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await api.post("/user/contact", form);
      if (res.status === 200) {
        toast.success("Thank you for contacting us");
        setForm(INITIAL);
      }
    } catch (err) {
      const data = err?.response?.data;
      toast.error(typeof data === "string" ? data : "Something went wrong");
    } finally {
      setSending(false);
    }
  };

  const field = (name, label, placeholder, type = "text") => (
    <div className={styles.field}>
      <label htmlFor={`contact-${name}`} className={styles.label}>{label}</label>
      <input
        id={`contact-${name}`}
        className={styles.input}
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        required
      />
    </div>
  );

  return (
    <section id="contact" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <span className={styles.eyebrow}>Get in touch</span>
          <h2 className={styles.title}>
            Connect
            <span className={styles.accent}>with Us Today!</span>
          </h2>
          <p className={styles.subtitle}>
            Have a question or interested in partnering with NexFellow? Reach out to us for any
            queries, partnerships opportunities, or collaboration ideas. We are here to help and
            excited to connect with you!
          </p>

          <div className={styles.features}>
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className={styles.feature}>
                <span className={styles.featureIcon}><Icon size={22} /></span>
                <h3 className={styles.featureTitle}>{title}</h3>
                <p className={styles.featureText}>{text}</p>
              </div>
            ))}
          </div>

          <div className={styles.infoList}>
            {INFO.map(({ icon: Icon, label, title, text }) => (
              <div key={label} className={styles.infoCard}>
                <span className={styles.infoIcon}><Icon size={22} /></span>
                <div className={styles.infoBody}>
                  <span className={styles.infoLabel}>{label}</span>
                  <span className={styles.infoTitle}>{title}</span>
                  <span className={styles.infoText}>{text}</span>
                </div>
                <span className={styles.infoArrow}><ArrowRight size={14} /></span>
              </div>
            ))}
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            {field("firstName", "First Name", "Enter First Name")}
            {field("lastName", "Last Name", "Enter Last Name")}
          </div>
          <div className={styles.row}>
            {field("email", "Email", "Enter Email", "email")}
            {field("phoneNumber", "Phone Number", "Enter Phone Number", "tel")}
          </div>
          {field("subject", "Subject", "Enter Subject")}
          <div className={styles.field}>
            <label htmlFor="contact-message" className={styles.label}>Message</label>
            <textarea
              id="contact-message"
              className={`${styles.input} ${styles.textarea}`}
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Enter Your Message here..."
              required
            />
          </div>
          <button type="submit" className={styles.submit} disabled={sending}>
            <Send size={16} />
            {sending ? "Sending..." : "Send Your Message"}
          </button>
        </form>
      </div>
    </section>
  );
}
