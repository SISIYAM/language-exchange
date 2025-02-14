import Link from "next/link";
import React from "react";

const HighlightedProfiles = () => {
  const profiles = [
    {
      name: "Sevil",
      image: "https://example.com/sevil.jpg",
      bio: "Highlight your profile and let... more people see you",
      isPro: true,
      buttonLabel: "Try Tandem Pro",
      languages: [],
    },
    {
      name: "淳民",
      image: "https://example.com/person1.jpg",
      bio: "你好很高兴认识你",
      languages: [
        { type: "FLUENT", code: "CN", flag: "🇨🇳", count: 1 },
        { type: "LEARNS", code: "EN", flag: "🇬🇧", count: 2 },
      ],
    },
    {
      name: "soulblue",
      image: "https://example.com/person2.jpg",
      bio: "Be like coffee this morning... Despite itself, yet gives us re-",
      languages: [
        { type: "FLUENT", code: "FR", flag: "🇫🇷", count: 4 },
        { type: "LEARNS", code: "PT", flag: "🇵🇹", count: 6 },
      ],
    },
    {
      name: "Linda",
      image: "https://example.com/person3.jpg",
      bio: "I would like to practice... English. As language ex-",
      languages: [
        { type: "FLUENT", code: "CN", flag: "🇨🇳", count: 1 },
        { type: "LEARNS", code: "EN", flag: "🇬🇧", count: 1 },
      ],
    },
    {
      name: "Xin",
      image: "https://example.com/person4.jpg",
      bio: "德语和英语口语练习",
      languages: [
        { type: "FLUENT", code: "CN", flag: "🇨🇳", count: 1 },
        { type: "LEARNS", code: "DE", flag: "🇩🇪", count: 1 },
      ],
    },
    {
      name: "王欣妍",
      image: "https://example.com/person5.jpg",
      bio: "风土人情",
      languages: [
        { type: "FLUENT", code: "CN", flag: "🇨🇳", count: 1 },
        { type: "LEARNS", code: "EN", flag: "🇬🇧", count: 1 },
      ],
    },
  ];

  return (
    <section className="py-6">
      <h2 className="text-md font-[500] mb-4 text-pink-500">
        Highlighted Profiles{" "}
        <span className="px-2 text-xs rounded-tr-md rounded-br-md rounded-tl-lg rounded-bl-sm text-white bg-pink-500">
          PRO
        </span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {profiles.map((profile, index) => (
          <ProfileCard key={index} profile={profile} />
        ))}
      </div>
    </section>
  );
};

const ProfileCard = ({ profile }) => {
  return (
    <Link
      href="/community/xsa2mbrkj"
      className={`bg-white rounded-lg shadow-md p-4 ${
        profile.isPro ? "bg-pink-100" : ""
      } text-center`}
    >
      <img
        src={
          "https://tandem.net/_next/image?url=https%3A%2F%2Fimages.ctfassets.net%2F0uov5tlk8deu%2F7I4r5LgUpRb9f4ZzcNCkbs%2Fee701fee9b1adbacc40eebc39f7eced4%2Fstefania.jpg&w=767&q=100"
        }
        alt={profile.name}
        className={`w-16 h-16 rounded-full mx-auto mb-3 ${
          profile.isPro ? "border-4 border-pink-500" : ""
        }`}
      />
      <h3 className="font-semibold text-md">{profile.name}</h3>
      <p className="text-sm text-gray-600 mb-2">{profile.bio}</p>
      {profile.isPro ? (
        <button className="bg-pink-500 text-white rounded-full px-4 py-1 text-sm font-semibold">
          {profile.buttonLabel}
        </button>
      ) : (
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {profile.languages.map((lang, index) => (
            <div
              key={index}
              className="flex items-center bg-gray-100 rounded-full px-3 py-0.5 text-xs"
            >
              <span className="mr-1">{lang.flag}</span>
              <span>{lang.code}</span>
              {lang.count > 0 && (
                <span className="ml-1 text-gray-500">+{lang.count}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </Link>
  );
};

export default HighlightedProfiles;
