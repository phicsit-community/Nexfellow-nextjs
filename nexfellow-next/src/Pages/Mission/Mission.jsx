import React from "react";
import Navbar from "../../components/Landing/Navbar/Navbar";
import Footer from "../../components/Landing/Footer/Footer";
import CtaBanner from "../../components/Landing/CtaBanner/CtaBanner";
import MissionHero from "../../components/Mission/MissionHero/MissionHero";
import ProblemSection from "../../components/Mission/ProblemSection/ProblemSection";
import ManifestoSection from "../../components/Mission/ManifestoSection/ManifestoSection";
import SixThingsSection from "../../components/Mission/SixThingsSection/SixThingsSection";
import FounderSection from "../../components/Mission/FounderSection/FounderSection";
import { BG } from "../../components/Landing/shared/tokens";

const Mission = () => {
  return (
    <div style={{ background: BG, minHeight: "100vh" }}>
      <Navbar />
      <MissionHero />
      <ProblemSection />
      <ManifestoSection />
      <SixThingsSection />
      {/* <FounderSection /> */}
      <CtaBanner />
      <Footer />
    </div>
  );
};

export default Mission;
