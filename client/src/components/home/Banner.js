"use client";
import Image from "next/image";
import React from "react";
import LanguageSelector from "./LanguageSelector";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const Banner = () => {
  const { t } = useLanguage();
  return (
    <div
      className="min-h-[469px] max-w-[1440px] mx-auto flex items-center bg-cover bg-center"
      // style={{ backgroundImage: `url('/bannerbg.png')` }}
    >
      <div className=" flex justify-between items-center w-[90%] mx-auto">
        <div className=" w-1/2">
          <Image
            src={"/banner.png"}
            width={400}
            height={300}
            alt="banner image"
          />
        </div>

        <div className="w-1/2">
          <h3 className=" text-[45px] leading-[55px] text-[#074C77] font-medium">
            Practice Languages with <br /> Native Speakers
          </h3>
          <p className=" text-xl font-bold text-[#407023] leading-[41px] my-3">
            Join us in our mission to save nature!  We&apos;re dedicating 10% of
            our income to green initiatives
          </p>
          <div className=" flex space-x-5">
            <LanguageSelector />
            <Link href={"/#"}>
              <button className=" hover:text-[#074C77] hover:bg-transparent text-base font-normal py-2 border-2 border-[#074C77] px-10 rounded-full  bg-[#074C77]  text-white">
                {t("startBtn")}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
