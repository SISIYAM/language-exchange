"use client";
import Image from "next/image";
import React, { useState } from "react";
import { FiMessageSquare, FiVideo, FiCheck, FiGlobe } from "react-icons/fi"; // React icons for the buttons
import { BsChatTextFill } from "react-icons/bs";
import VideoInFrame from "./VideoFrame";

const Features = () => {
  const [imgSrc, setImgSrc] = useState("/phone1.png");
  const [activeTab, setActiveTab] = useState("Chat");

  console.log(activeTab)

  const tabs = [
    { name: "Chat", icon: <BsChatTextFill /> },
    { name: "Video", icon: <FiVideo /> },
    { name: "Correction", icon: <FiCheck /> },
    { name: "Translate", icon: <FiGlobe /> },
  ];
  return (
    <div className=" text-[#074C77]">
      <h2 className=" text-center text-5xl leading-[60px]">
        Irma and Jane met on <br />
        the <span className=" font-bold text-black">app Enlighten</span>...
      </h2>
      <div className=" flex items-center mx-auto justify-center my-10 space-x-10 ">
        <div>
          { activeTab === "Chat" && <Image src={imgSrc} width={456} height={0} alt="phone 1" className=" max-w-[350px] max-h-[700px]" />}
          {activeTab === "Video" && <VideoInFrame video={"/video.mp4"}/>}
          {activeTab === "Correction" && <VideoInFrame video={"/correction.mp4"}/>}
          {activeTab === "Translate" && <VideoInFrame video={"/translate.mp4"}/>}
          
        </div>
        <div className=" w-1/2 h-full px-10">
            {/* mobile screen change tab */}
          <div className="flex justify-center py-4 px-10">
            {tabs.map((tab) => (
              <div
                key={tab.name}
                className={`flex flex-col justify-between items-center cursor-pointer pb-2 w-full ${
                  activeTab === tab.name ? "text-[#2cc1d7] border-b-4 border-[#2cc1d7]" : "text-gray-400"
                }`}
                onClick={() => setActiveTab(tab.name)}
              >
                <div
                  className={`p-6 rounded-full border-2 text-3xl font-extrabold ${
                    activeTab === tab.name
                      ? "border-[#2cc1d7]"
                      : "border-gray-300"
                  }`}
                >
                  {tab.icon}
                </div>
                <span
                  className={`mt-2 ${
                    activeTab === tab.name
                      ? "text-[#2cc1d7] font-semibold"
                      : "text-gray-500"
                  }`}
                >
                  {tab.name}
                </span>
              </div>
            ))}
          </div>
          <p className=" text-3xl font-medium leading-[45px] tracking-[0.5px] mt-20 px-10">...and use Enlighten's intuitive interface and support features to help you learn a language together! Irma helps Jane with German, Jane helps Irma with English.</p>
        </div>
      </div>
    </div>
  );
};

export default Features;
