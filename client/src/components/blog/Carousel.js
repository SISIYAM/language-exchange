"use client";

// Import Swiper React components and styles
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Import Swiper styles
import 'swiper/swiper-bundle.css';

// Import required modules
import { Autoplay, Pagination, Navigation } from "swiper/modules";

// Custom styles
const slideStyle = {
  height: '600px', // Increased the height from 400px to 600px
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
};

const overlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.3)', // 30% opacity
  zIndex: 1,
};

const contentStyle = {
  position: 'relative',
  zIndex: 2, // Ensures the content appears above the overlay
  color: 'white', // Example: text color
};

const buttonStyle = {
  width: '30px', // Smaller width
  height: '30px', // Smaller height
  fontSize: '12px', // Smaller text inside button
};

const slides = [
  {
    id: 1,
    backgroundImage: 'url("https://res.cloudinary.com/dh20zdtys/image/upload/v1724361462/1_k1ffwn.webp")',
  },
  {
    id: 2,
    backgroundImage: 'url("https://res.cloudinary.com/dh20zdtys/image/upload/v1724361461/4_lm1tal.webp")',
  },
  {
    id: 3,
    backgroundImage: 'url("https://res.cloudinary.com/dh20zdtys/image/upload/v1724361461/3_vujcna.jpg")',
  },
];

const Carousel = () => {
  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      navigation={true}
      modules={[Autoplay, Pagination, Navigation]}
      style={{ height: '450px' }} // Set Swiper height to 600px
    >
      {slides.map((slide) => (
        <SwiperSlide key={slide.id} style={{ ...slideStyle, backgroundImage: slide.backgroundImage }}>
          {/* Overlay with dark background */}
          <div style={overlayStyle}></div>
          
          {/* Content of the slide */}
          <div style={contentStyle}>
            {/* Add your slide content here */}
          </div>
        </SwiperSlide>
      ))}
      <style jsx global>{`
        .swiper-button-next, .swiper-button-prev {
          width: 30px;
          height: 30px;
        }

        .swiper-button-next::after, .swiper-button-prev::after {
          font-size: 12px;
        }
      `}</style>
    </Swiper>
  );
};

export default Carousel;
