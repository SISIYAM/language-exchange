"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiSearch, FiSliders } from "react-icons/fi";
import HighlightedProfiles from "./HighlightedProfiles";
import Link from "next/link";
import { fetchMembers } from "@/features/user/membersSlice";
import toast from "react-hot-toast";

// Debounce function to limit the rate of API calls
const debounce = (func, wait) => {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// Member card to display individual member's data
const MemberCard = ({ member }) => {
  const getLanguageDisplay = (langArray) => {
    if (!langArray || !Array.isArray(langArray)) return [];
    return langArray.map((lang) => ({
      code: lang.language,
      level: lang.level,
      flag: getLanguageFlag(lang.language),
    }));
  };

  const getLanguageFlag = (language) => {
    const flags = {
      English: "🇬🇧",
      French: "🇫🇷",
      Spanish: "🇪🇸",
      German: "🇩🇪",
      Chinese: "🇨🇳",
      Japanese: "🇯🇵",
      Korean: "🇰🇷",
      // Add more languages as needed
    };
    return flags[language] || "🌐";
  };

  const speaks = getLanguageDisplay(member.speaks || []);
  const learns = getLanguageDisplay(member.learns || []);

  return (
    <Link
      href={`/community/${member._id}`}
      className="bg-white border rounded-lg p-3 flex items-center space-x-4 hover:shadow-lg transition-shadow"
    >
      <img
        src={member?.profilePicture || "/default-avatar.png"}
        alt={member?.name}
        className="w-28 h-28 rounded-lg object-cover"
        onError={(e) => {
          e.target.src = "/default-avatar.png";
        }}
      />
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <span
            className={`block w-3 h-3 rounded-full ${
              member.status === "online"
                ? "bg-green-400"
                : member.status === "away"
                ? "bg-yellow-400"
                : "bg-red-400"
            }`}
          ></span>
          <h3 className="font-semibold text-lg">{member?.name}</h3>
        </div>
        <p className="text-sm text-gray-600 mb-2">{member?.description}</p>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <span className="font-medium text-gray-700">Speaks:</span>
            <div className="flex gap-2">
              {speaks.map((lang, idx) => (
                <span
                  key={idx}
                  className="flex items-center bg-gray-100 rounded-full px-2 py-1"
                >
                  {lang.flag} {lang.code}
                  <span className="text-xs text-gray-500 ml-1">
                    ({lang.level})
                  </span>
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <span className="font-medium text-gray-700">Learning:</span>
            <div className="flex gap-2">
              {learns.map((lang, idx) => (
                <span
                  key={idx}
                  className="flex items-center bg-blue-50 rounded-full px-2 py-1"
                >
                  {lang.flag} {lang.code}
                  <span className="text-xs text-gray-500 ml-1">
                    ({lang.level})
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Tabs for different member views
const Tabs = ({ activeTab, onTabChange, userLocation }) => {
  const tabs = [
    { name: "All members", icon: "🔍" },
    { name: "Near me", icon: "📍", requiresLocation: true },
    { name: "Travel", icon: "✈️" },
  ];

  const handleTabClick = (tab) => {
    if (tab.requiresLocation && !userLocation) {
      // Request location permission
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            onTabChange(tab.name, {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          () => {
            toast.error("Please enable location services to use this feature");
          }
        );
      } else {
        toast.error("Location services are not supported by your browser");
      }
    } else {
      onTabChange(tab.name);
    }
  };

  return (
    <div className="flex gap-5 py-7">
      {tabs.map((tab) => (
        <button
          key={tab.name}
          onClick={() => handleTabClick(tab)}
          className={`flex items-center hover:bg-gray-800 transition-all hover:text-white px-4 py-2 rounded-full ${
            activeTab === tab.name
              ? "bg-gray-800 text-white"
              : "bg-transparent border border-gray-300 text-gray-700"
          }`}
        >
          <span className="mr-2">{tab.icon}</span>
          {tab.name}
        </button>
      ))}
    </div>
  );
};

// Search bar for filtering members
const SearchBar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  return (
    <div className="flex items-center gap-4 max-w-md relative">
      <div className="flex items-center bg-gray-200 rounded-full px-4 py-2 flex-grow">
        <FiSearch className="text-gray-500 mr-2" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Find members or topics"
          className="bg-transparent outline-none text-gray-700 placeholder-gray-500 flex-grow"
        />
      </div>
      <button
        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
        className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
      >
        <FiSliders className="text-gray-500" />
      </button>

      {isFiltersOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg p-4 w-64 z-10">
          {/* Add filter options here */}
          <div className="space-y-4">
            <h3 className="font-semibold">Filters</h3>
            {/* Add more filter options as needed */}
          </div>
        </div>
      )}
    </div>
  );
};

const MembersGrid = () => {
  const dispatch = useDispatch();
  const { members, status, error } = useSelector((state) => state.members);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [activeTab, setActiveTab] = useState("All members");
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    dispatch(fetchMembers());
  }, [dispatch]);

  useEffect(() => {
    setFilteredMembers(members);
  }, [members]);

  const handleTabChange = async (tabName, location) => {
    setActiveTab(tabName);
    if (location) {
      setUserLocation(location);
      try {
        const response = await fetch(
          `http://localhost:8080/api/members/nearby?latitude=${location.latitude}&longitude=${location.longitude}`
        );
        const data = await response.json();
        setFilteredMembers(data);
      } catch (error) {
        console.error("Error fetching nearby members:", error);
        toast.error("Failed to fetch nearby members");
      }
    } else if (tabName === "All members") {
      setFilteredMembers(members);
    }
    // Add handling for "Travel" tab if needed
  };

  const fetchSearchResults = async (query) => {
    if (query) {
      try {
        const response = await fetch(
          `http://localhost:8080/api/members/search?query=${query}`
        );
        const data = await response.json();
        setFilteredMembers(data);
      } catch (error) {
        console.error("Error fetching search results:", error);
        toast.error("Failed to fetch search results");
      }
    } else {
      setFilteredMembers(members);
    }
  };

  const debouncedFetchSearchResults = debounce(fetchSearchResults, 300);

  const handleSearch = (query) => {
    debouncedFetchSearchResults(query);
  };

  let content;
  if (status === "loading") {
    content = (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  } else if (status === "succeeded") {
    content = (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredMembers.map((member) => (
          <MemberCard key={member._id} member={member} />
        ))}
      </div>
    );
  } else if (status === "failed") {
    content = (
      <div className="text-center text-red-500">
        Error: {error || "Failed to load members"}
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen">
      <div className="max-w-[1450px] mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Tabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            userLocation={userLocation}
          />
          <SearchBar onSearch={handleSearch} />
        </div>
        {content}
        <HighlightedProfiles />
      </div>
    </div>
  );
};

export default MembersGrid;
