"use client";
// import { Divider } from "@nextui-org/react";
import Image from "next/image";
import React, { useState } from "react";
import { CiSquarePlus } from "react-icons/ci";
import { GoPerson } from "react-icons/go";
import { IoCodeSlashOutline } from "react-icons/io5";
import { PiWebhooksLogoLight } from "react-icons/pi";
import { FaRegFileCode } from "react-icons/fa";
import { CiCircleMore } from "react-icons/ci";

import { MdOutlineChevronLeft, MdOutlineChevronRight } from "react-icons/md";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MdOutlineSettings } from "react-icons/md";
import { IoHelpCircleOutline } from "react-icons/io5";
import { RiLogoutBoxRLine } from "react-icons/ri";
// import { useSelector } from "react-redux";
// import { useLogoutMutation } from "@/services/auth/authApi";

// Define routeList with React Icons
const routeList = [
  { route: "Blog", icon: CiSquarePlus },
  { route: "Social Accounts", icon: GoPerson },
  { route: "API Key", icon: IoCodeSlashOutline },
  { route: "Webhooks", icon: PiWebhooksLogoLight },
  { route: "API Docs", icon: FaRegFileCode },
];

// Define SETTINGS ROUTE with React Icons
const settingsRoute = [
  { route: "Settings", icon: MdOutlineSettings },
  { route: "Account", icon: GoPerson },
  { route: "Help", icon: IoHelpCircleOutline },
];

const Sidebar = ({handleOpen}) => {
  // const [logout, { isLoading }] = useLogoutMutation();
  const [isOpen, setIsOpen] = useState(true);
  let pathname = usePathname();
  const router = useRouter();

  if(pathname === "/dashboard"){
    pathname = "/dashboard/blog"
  }

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    handleOpen(isOpen)
  };
  // const user = useSelector((state) => state.authorizedUser.user);
  // console.log(user)


  const handleLogout = async () => {
    // try {
    //   await logout().unwrap();
    //   // Perform any additional logout logic here (e.g., redirecting to login page)
    //   console.log('User logged out successfully');
    //   router.push("/login")

    // } catch (error) {
    //   console.error('Failed to logout:', error);
    // }
    console.log("clicked on logout")
  };

  return (
    <div className=" w-full font-inter sidebar" style={{ fontFamily: "inherit" }}>
      <div
        className={` absolute left-0 top-0 transition-transform transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } text-black w-64`}
      >
        <button
          onClick={toggleSidebar}
          className={`absolute top-8 shadow-md ${
            isOpen ? "right-[-20px]" : "right-[-32px]"
          } bg-white text-2xl p-1 border text-black rounded-xl`}
        >
          {isOpen ? <MdOutlineChevronLeft /> : <MdOutlineChevronRight />}
        </button>
        <div
          className={`${
            !isOpen && "hidden"
          } shadow-lg rounded-r-3xl overflow-y-auto`}
          style={{ backgroundColor: "white", width: "100%", height: "100%" }}
        >
          <div className="p-5 flex flex-col space-y-6 font-inter">
            <div className="flex items-center gap-4 mb-4">
              <Image
                // src={user?.img? user.img : "/profileicon.jpg"}
                src={"/profileicon.jpg"}
                width={30}
                height={30}
                alt="profile"
                className="rounded-full"
                style={{
                  boxShadow: "0 4px 4px rgba(0, 0, 0, 0.3)", // Adjust the shadow as needed
                }}
              />
              <div>
                <h5 className="text-xs font-medium text-[#757575] leading-[22.3px]">
                  BASIC PLAN
                </h5>
                <h3 className="text-base font-medium">
                  {/* {user.name} */}
                  User Name
                  </h3>
              </div>
            </div>
            {/* <Divider /> */}
            <hr/>
            {/* main  */}
            <div className="flex flex-col text-[#757575]">
              <p className="text-xs font-medium text-[#757575] mt-3 pl-5">
                MAIN
              </p>
              <div className="flex flex-col gap-y-2 mt-3">
                {routeList.map((item, index) => (
                  <Link
                    href={`/dashboard/${item.route.toLowerCase().split(" ").join("-")}`}
                    key={index}
                    className={` max-h-[45.26px] flex items-center space-x-2 px-3 py-3 border border-x-3 border-white rounded-xl hover:bg-gradient-to-r hover:from-[#8882fd3b] hover:to-[#277dff2b] hover:bg-opacity-30 hover:border-x-3 hover:border-y-0 hover:border-l-[#8982fd] hover:border-r-[#277DFF] active:bg-gradient-to-r active:from-[#8982fd] active:to-[#277DFF] active:text-white ${
                      pathname == `/dashboard/${item.route.toLowerCase().split(" ").join("-")}`
                        ? "bg-gradient-to-r from-[#8982fd] to-[#277DFF] text-white"
                        : ""
                    }`}
                  >
                    {item.icon && (
                      <item.icon
                        className="text-xl active:text-white"
                        style={{
                          color:
                            pathname == `/dashboard/${item.route.toLowerCase()}`
                              ? "white"
                              : "black",
                        }}
                      />
                    )}
                    <span className="text-base font-medium">{item.route}</span>
                  </Link>
                ))}
                <div
                  className={` max-h-[45.26px] flex items-center space-x-2 px-3 py-3 border border-white rounded-xl hover:bg-gradient-to-r hover:from-[#c784fa22] hover:to-[#277dff23] hover:bg-opacity-30 hover:border-x-3 hover:border-y-0 hover:border-l-[#8982fd] hover:border-r-[#277DFF] active:bg-gradient-to-r active:from-[#8982fd] active:to-[#277DFF] active:text-white `}
                >
                  <CiCircleMore className="text-xl active:text-white" />
                  <select className="text-base font-medium bg-transparent border-none active:border-none w-full focus:border-none focus:outline-none px-2 grid grid-cols-1 gap-y-2">
                    <option className=" py-2">More</option>
                    <option className=" py-2" value="lorem">
                      Lorem
                    </option>
                    <option className=" py-2" value="inpsum">
                      Ipsum
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* <Divider /> */}
            {/* Settings */}
            <div className="flex flex-col text-[#757575]">
              <p className="text-xs font-medium text-[#757575] mt-3 pl-5">
                SETTINGS
              </p>
              <div className="flex flex-col gap-y-2 mt-3">
                {settingsRoute.map((item, index) => (
                  <Link
                    href={`/dashboard/${item.route.toLowerCase()}`}
                    key={index}
                    className={` max-h-[45.26px] flex items-center space-x-2 px-3 py-3 border border-x-3 border-white rounded-xl hover:bg-gradient-to-r hover:from-[#c784fa3b] hover:to-[#277dff2b] hover:bg-opacity-30 hover:border-x-3 hover:border-y-0 hover:border-l-[#8982fd] hover:border-r-[#277DFF] active:bg-gradient-to-r active:from-[#8982fd] active:to-[#277DFF] active:text-white ${
                      pathname == `/dashboard/${item.route.toLowerCase()}`
                        ? "bg-gradient-to-r from-[#8982fd] to-[#277DFF] text-white"
                        : ""
                    }`}
                  >
                    {item.icon && (
                      <item.icon
                        className="text-xl active:text-white"
                        style={{
                          color:
                            pathname == `/dashboard/${item.route.toLowerCase()}`
                              ? "white"
                              : "black",
                        }}
                      />
                    )}
                    <span className="text-base font-medium">{item.route}</span>
                  </Link>
                ))}
                <div
                  className={` max-h-[45.26px] flex items-center space-x-2 px-3 py-3 border border-x-3 border-white rounded-xl hover:border-x-3 hover:border-y-0 hover:border-l-[#D55F5A] hover:border-r-[#D55F5A] active:bg-gradient-to-r  `}
                onClick={handleLogout}
                >
                  <RiLogoutBoxRLine className="text-xl text-[#D55F5A] active:text-white" />
                  <span className="text-base font-medium text-[#D55F5A] border-none active:border-none">
                    Logout Account
                  </span>
                </div>
              </div>
            </div>

            {/* bottom message */}
            <div className="flex justify-center">
              <div className=" absolute z-50">
                <div
                  className=" z-50"
                  style={{ transform: "translateY(-20%)" }}
                >
                  <div className="border-4 border-white rounded-full w-16 h-16 flex items-center justify-center bg-gradient-to-br from-[#868CFF] to-[#4318FF]">
                    <div className="w-8 h-8 rounded-full border-8 border-white bg-gradient-to-br from-[#868CFF] to-[#4318FF] flex items-end justify-end rotate-45">
                      <div className=" w-3 h-3 rounded-full bg-white"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-[#8982fd] to-[#277DFF] p-5 rounded-xl relative">
              <div className="text-center text-white mt-5">
                <h3 className="font-bold text-[13.76px] mb-1">
                  Upgrade your plan
                </h3>
                <p className="font-medium text-[12.04px]">
                  to get access to all features! Connect with Venus World!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
