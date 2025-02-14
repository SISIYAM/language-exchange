"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const profiles = [
  {
    name: "Philip",
    studies: "Spanish",
    knows: "English",
    studiesFlag: "/flag/pl.svg",
    knowsFlag: "/flag/zh.svg",
    image: "/person.jpeg",
  },
  {
    name: "Luis",
    studies: "Italian",
    knows: "Spanish",
    studiesFlag: "/flag/es.webp",
    knowsFlag: "/flag/en-uk.svg",
    image: "/person2.jpeg",
  },
  {
    name: "지원",
    studies: "German",
    knows: "Korean",
    studiesFlag: "/flag/zh.svg",
    knowsFlag: "/flag/pl.svg",
    image: "/person3.jpeg",
  },
  {
    name: "Jane",
    studies: "English",
    knows: "German",
    studiesFlag: "/flag/pl.svg",
    knowsFlag: "/flag/en-uk.svg",
    image: "/person4.jpeg",
  },
  {
    name: "John",
    studies: "Italian",
    knows: "English",
    studiesFlag: "/flag/pl.svg",
    knowsFlag: "/flag/pl.svg",
    image: "/person5.jpeg",
  },
  {
    name: "Sarah",
    studies: "English",
    knows: "Italian",
    studiesFlag: "/flag/pl.svg",
    knowsFlag: "/flag/en-uk",
    image: "/person6.jpeg",
  },
];

const Testimonial = () => {
  return (
    <div className=" min-h-screen p-10">
      <div className="mx-auto text-center">
        <h1 className="text-3xl font-bold mb-8 text-blue-900">
          Millions of language partners. Any language combinations.
        </h1>

        <div className="relative overflow-hidden px-36">
          <Swiper
            modules={[Navigation, Pagination]}
            navigation={{
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            }}
            pagination={{ clickable: true }}
            spaceBetween={30}
            slidesPerView={1}
            breakpoints={{
              640: {
                slidesPerView: 1,
              },
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
          >
            {profiles.map((profile, index) => (
              <SwiperSlide key={index}>
                <div className="bg-white rounded-lg shadow-lg p-5 flex items-center justify-between">
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="w-24 h-24 rounded-full mb-4"
                  />
                  <div className="text-start">
                    <h2 className="font-semibold text-2xl text-right">
                      {profile.name}
                    </h2>
                    <div className="mt-2 text-sm flex items-center space-x-2">
                      <span className=" text-xl font-extralight">
                        {" "}
                        Wants to learn
                      </span>{" "}
                      <img src={profile.studiesFlag} className=" w-5 h-5" />
                    </div>
                    <div className="mt-1 text-sm flex items-center space-x-2">
                      <span className=" text-xl font-extralight">
                        Can teach you{" "}
                      </span>{" "}
                      <img src={profile.knowsFlag} className=" w-5 h-5" />
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Swiper navigation buttons */}
          <div className="swiper-button-prev absolute left-0 top-1/2 transform -translate-y-1/2 text-blue-600 text-3xl z-10">
            <FaChevronLeft />
          </div>
          <div className="swiper-button-next absolute right-0 top-1/2 transform -translate-y-1/2 text-blue-600 text-3xl z-10">
            <FaChevronRight />
          </div>
        </div>

        <button className="px-8 py-3 bg-[#074c77] text-white font-semibold rounded-full hover:bg-blue-800 transition mt-8">
          Start learning
        </button>
      </div>

      <div 
      className="mx-auto w-full text-center bg-cover bg-center min-h-[26rem] my-28 flex justify-center items-center bg-black"
      style={{
        backgroundImage: `url('/flag/footerbg.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: 'black'
      }}
      >
        <div>
        <h3 className=" text-5xl font-light text-gray-200">Discover your <br/> community</h3>
        <p className=" max-w-[476px] text-lg font-semibold text-gray-200 mt-5">Enligten connects you with millions of individuals who are experiencing the delights and hurdles of mastering a new language. Come join our vibrant community and contribute your thoughts to the world!</p>
        </div>
      </div>
    </div>
  );
};

export default Testimonial;
