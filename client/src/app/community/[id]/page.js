import ProfileDetails from "@/components/profile/ProfileDetails";
import React from "react";

const page = ({ params }) => {
  const { id } = params;

  return (
    <div>
      <ProfileDetails id={id} />
    </div>
  );
};

export default page;
