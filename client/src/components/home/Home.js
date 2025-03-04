import React from "react";
import Banner from "./Banner";
import LanguageGrid from "./LanguageGrid";
import TeamSection from "./TeamSection";
import Features from "./Features";
import HowItWorks from "./HowItWork";
import Testimonial from "./Testimonial";
import Testimonials from "./Review";

const HomePage = () => {
  return (
    <>
      <Banner />
      <LanguageGrid />
      <TeamSection />
      <Features />
      <HowItWorks />
      <Testimonial />
      <Testimonials />
    </>
  );
};

export default HomePage;
