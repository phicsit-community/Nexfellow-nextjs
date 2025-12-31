"use client";

import React from "react";
import Link from "next/link";

//assets
import LOGO from "../../assets/navbarlogo2.svg";
import TWITTER from "./assets/Twitter.svg";
import LINKEDIN from "./assets/LinkedIn.svg";
import INSTAGRAM from "./assets/Instagram.svg";
import FACEBOOK from "./assets/Facebook.svg";

import style from "./Footer.module.css";

const Footer = () => {
  return (
    <div className={style.footer}>
      <div className={style.footercontent}>
        <div className={style.content1}>
          <div className={style.content1logo}>
            <Link href="/">
              <img src={LOGO.src || LOGO} alt="NexFellow Logo" />
            </Link>
          </div>
          <div className={style.content1content}>
            <p>
              NexFellow platform lets you compete globally across a variety of
              topics. Battle it out, climb the leaderboards, and connect with a
              vibrant community of fellow geeks.
            </p>
          </div>
          <div className={style.contnet1links}>
            <a href="https://x.com/phicsit">
              <img src={TWITTER.src || TWITTER} alt="Twitter" />
            </a>
            <a href="https://www.linkedin.com/company/phicsit">
              <img src={LINKEDIN.src || LINKEDIN} alt="LinkedIn" />
            </a>
            <a href="https://www.instagram.com/phicsit.in">
              <img src={INSTAGRAM.src || INSTAGRAM} alt="Instagram" />
            </a>
            <a href="https://www.facebook.com/PHICSIT">
              <img src={FACEBOOK.src || FACEBOOK} alt="Facebook" />
            </a>
          </div>
        </div>
        <div className={style.Links}>
          <div className={style.content2}>
            <div className={style.content2heading}>
              <p>Quick Links</p>
            </div>
            <div className={style.content2points}>
              <a href="/contests">Contests</a>
              <a href="/leaderboard">Leaderboard</a>
              <Link href="/comingsoon">Blogs</Link>
              <a href="#">Advertise With Us</a>
              <a href="/signup">Sign Up</a>
            </div>
          </div>
          <div className={style.content3}>
            <div className={style.content3heading}>
              <p className={style.para}>Company</p>
            </div>
            <div className={style.content2points}>
              <a href="/about-us">About Us</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Community Guidelines</a>
              <a href="#">Code of Conduct</a>
              <a href="#">Terms of Services</a>
            </div>
          </div>
        </div>
      </div>
      <div className={style.copyright}>
        <p>Copyright ©️ 2024 PHICSIT InfoTech Pvt. Ltd. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Footer;
