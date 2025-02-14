import React from "react";

const MainContainer = ({ children }) => {
  return (
    <div className=" w-full bg-[#f4f1ee] mx-auto">
      <div className=" max-w-[1440px] bg-[#f4f1ee]">{children}</div>
    </div>
  );
};

export default MainContainer;
