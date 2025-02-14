"use client";
import UserMenu from "@/components/ui/UserMenu";
import { useLanguage } from "@/context/LanguageContext";
import { fetchLoggedInUser } from "@/features/user/userSlice";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const privet = ["/login", "/sign-up", "/forgot-password", "/reset-password"];

const Navbar = () => {
  const { t } = useLanguage();
  const pathName = usePathname();
  const dispatch = useDispatch();
  const { currentUser, loading, error } = useSelector((state) => state.user);

  useEffect(() => {
    // Dispatch the thunk to fetch the logged-in user's details
    dispatch(fetchLoggedInUser());
  }, [dispatch]);
  const navList = [
    { name: t("nav.findPartner"), url: "community" },
    { name: t("nav.chat"), url: "chat" },
    { name: t("nav.blog"), url: "blog" },
    { name: t("nav.download"), url: "download" },
  ];

  const [isSticky, setIsSticky] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 8);
      setIsScrolled(window.scrollY > 8);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isPrivatePath = privet.some((privetPath) =>
    pathName.includes(privetPath)
  );

  // Text color changes based on scroll on blog page only
  const textColorClass =
    pathName === "/blog" && !isScrolled ? "text-white" : "text-[#074C77]";

  return (
    <div
      className={`w-full z-50 transition-colors duration-300 ${
        pathName === "/blog" ? "fixed my-0" : "sticky"
      } ${isSticky ? "bg-white" : "bg-transparent"} ${
        pathName === "/dashboard" && "hidden"
      }`}
      style={{ top: pathName === "/blog" ? "-16px" : "0px" }} // Adjust for blog positioning
    >
      <div className="max-w-[1440px] mx-auto flex justify-between items-center px-5 py-2">
        <div className="flex items-center justify-between lg:w-1/2">
          <Link href={"/"}>
            <div className="flex items-center space-x-1">
              <Image
                src="https://res.cloudinary.com/dh20zdtys/image/upload/v1723709261/49f87c8af2a00c070b11e2b15349fa1c_uakips.png"
                width={50}
                height={50}
                alt="Logo"
              />
              <h2 className={`${textColorClass} font-bold text-xl`}>
                Enlighten
              </h2>
            </div>
          </Link>

          {!isPrivatePath && (
            <div className="flex space-x-16">
              {navList.map((item) => (
                <Link
                  href={`/${item.url}`}
                  key={item.name}
                  className="group hover:font-bold"
                >
                  <p className={`${textColorClass} text-base font-medium`}>
                    {item.name}
                  </p>
                  <p className="w-[100%] rounded-full h-[2px] bg-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {!currentUser && (
          <div className="flex space-x-7">
            {pathName !== "/login" && (
              <Link href={"/login"}>
                <button
                  className={` ${
                    pathName === "/blog"
                      ? `${
                          !isSticky
                            ? "text-white border-white"
                            : "text-[#074C77] border-[#074C77]"
                        } `
                      : "text-[#074C77] border-[#074C77]"
                  } ${
                    !isSticky ? " text-[#074C77] border-[#074C77]" : ""
                  }  text-base font-normal border-2 py-2 px-10 rounded-full hover:bg-[#074C77] hover:text-white`}
                >
                  {t("loginButton")}
                </button>
              </Link>
            )}
            {pathName !== "/sign-up" && (
              <Link href={"/sign-up"}>
                <button className="hover:text-[#074C77] hover:bg-transparent text-base font-normal border-2 border-[#074C77] py-2 px-10 rounded-full bg-[#074C77] text-white">
                  {t("signupButton")}
                </button>
              </Link>
            )}
          </div>
        )}

        {currentUser && <UserMenu />}
      </div>
    </div>
  );
};

export default Navbar;
