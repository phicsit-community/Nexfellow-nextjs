import React from "react";
import Hero from "../../components/Mission/Hero/Hero";
import style from "./Mission.module.css";
import GetMoreWithCommunity from "../../components/Mission/GetMoreWithGCCommunity/GetMoreWithGCCommunity";
import ContactCTA from "../../components/Landing/ContactCTA/ContactCTA";
import Footer from "../../components/Landing/Footer/Footer";
import Values from "../../components/Mission/Values/Values";
import Navbar from "../../components/Landing/Navbar/Navbar";
import WhatDrives from "../../components/Mission/WhatDrivesUs/WhatDrives";
import MissonAndVision from "../../components/Mission/MissonAndVision/MissonAndVision";

const Mission = () => {
  return (
    <div className={style.mission}>
      <Navbar />
      <div className={style.container}>
        <Hero />
        <WhatDrives />
        <MissonAndVision />
        {/* <GetMoreWithCommunity /> */}
        <Values />
        {/* <ContactCTA /> */}
        <Footer />
      </div>
    </div>
  );
};

export default Mission;
