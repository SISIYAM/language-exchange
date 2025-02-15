"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const HighlightedProfiles = () => {
  const { members } = useSelector((state) => state.members);
  const [highlightedProfiles, setHighlightedProfiles] = useState([]);

  useEffect(() => {
    // Get 6 random members for highlighted profiles
    if (members.length > 0) {
      const shuffled = [...members].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 6);
      setHighlightedProfiles(selected);
    }
  }, [members]);

  const getLanguageFlag = (language) => {
    const flags = {
      English: "🇬🇧",
      French: "🇫🇷",
      Spanish: "🇪🇸",
      German: "🇩🇪",
      Chinese: "🇨🇳",
      Japanese: "🇯🇵",
      Korean: "🇰🇷",
    };
    return flags[language] || "🌐";
  };

  return (
    <section className="py-6">
      <h2 className="text-md font-[500] mb-4 text-pink-500">
        Highlighted Profiles{" "}
        <span className="px-2 text-xs rounded-tr-md rounded-br-md rounded-tl-lg rounded-bl-sm text-white bg-pink-500">
          PRO
        </span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {highlightedProfiles.map((profile, index) => (
          <ProfileCard
            key={profile._id}
            profile={profile}
            isPro={index === 0}
            getLanguageFlag={getLanguageFlag}
          />
        ))}
      </div>
    </section>
  );
};

const ProfileCard = ({ profile, isPro, getLanguageFlag }) => {
  const truncateBio = (bio, maxLength = 50) => {
    if (!bio) return "";
    return bio.length > maxLength ? bio.substring(0, maxLength) + "..." : bio;
  };

  return (
    <Link
      href={`/community/${profile._id}`}
      className={`bg-white rounded-lg shadow-md p-4 ${
        isPro ? "bg-pink-50" : ""
      } text-center hover:shadow-lg transition-shadow`}
    >
      <img
        src={profile.profilePicture || "/default-avatar.png"}
        alt={profile.name}
        className={`w-16 h-16 rounded-full mx-auto mb-3 object-cover ${
          isPro ? "border-4 border-pink-500" : ""
        }`}
      />
      <h3 className="font-semibold text-md">{profile.name}</h3>
      <p className="text-sm text-gray-600 mb-2">
        {truncateBio(profile.description)}
      </p>
      {isPro ? (
        <button className="bg-pink-500 text-white rounded-full px-4 py-1 text-sm font-semibold hover:bg-pink-600 transition-colors">
          Try Tandem Pro
        </button>
      ) : (
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {profile.speaks?.map((lang, index) => (
            <div
              key={index}
              className="flex items-center bg-gray-100 rounded-full px-3 py-0.5 text-xs"
            >
              <span className="mr-1">{getLanguageFlag(lang.language)}</span>
              <span>{lang.language}</span>
            </div>
          ))}
          {profile.learns?.map((lang, index) => (
            <div
              key={index}
              className="flex items-center bg-blue-50 rounded-full px-3 py-0.5 text-xs"
            >
              <span className="mr-1">{getLanguageFlag(lang.language)}</span>
              <span>{lang.language}</span>
            </div>
          ))}
        </div>
      )}
    </Link>
  );
};

export default HighlightedProfiles;
