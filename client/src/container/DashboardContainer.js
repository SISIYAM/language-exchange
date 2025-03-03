"use client";
import Sidebar from "@/components/admin/dashboard/sidebar";
import React, { useState } from "react";

const DashboardLayout = ({ children }) => {
  const [isOpen, setOpen] = useState(false);
  const handleIsopen = (open) => {
    setOpen(open);
  };
  return (
    <div>
      <div className=" flex max-w-[1440px] mx-auto">
        <div className=" max-w-72 h-full">
          <Sidebar handleOpen={handleIsopen} />
        </div>
        <div
          className="conditional-padding"
          style={{
            paddingLeft: !isOpen ? "290px" : "50px",
            paddingTop: "30px",
            width: "100%",
            overflowX: "hidden",
          }}
        >
          <div
            className=" flex flex-col items-center"
            style={{ minHeight: "1000px" }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
