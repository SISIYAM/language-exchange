"use client";

import React from 'react';

const VideoInFrame = ({video}) => {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        {/* Container for the phone frame */}
        <div className="relative w-[350px] h-[700px]">
          {/* The phone frame image */}
          <img src='/frame.webp' alt="Phone Frame" className="absolute inset-0 w-full h-full" />
  
          {/* The video inside the frame */}
          <video
            src={video}
            autoPlay
            loop
            muted
            // controls
            className="absolute top-[18px] left-[6%] w-[89%] h-[95%] object-cover rounded-[40px]"
          />
        </div>
      </div>
    );
};

export default VideoInFrame;
