"use client";
import React, { useState, useEffect } from "react";
import { FiSearch, FiSliders } from "react-icons/fi";
import HighlightedProfiles from "./HighlightedProfiles";
import Link from "next/link";
import axios from "axios"; // Import axios for API calls
import Cookies from "js-cookie";

// Define the API base URL
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
const defaultImage =
  "https://imgs.search.brave.com/m12gFeEaYTH9TW9JHo1E4K4UFZBIAGpFdv-O_jdbty0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzAzLzQ2LzgzLzk2/LzM2MF9GXzM0Njgz/OTY4M182bkFQemJo/cFNrSXBiOHBtQXd1/ZmtDN2M1ZUQ3d1l3/cy5qcGc";

// Member card to display individual member's data
const MemberCard = ({ member }) => {
  // Function to map language codes to country names
  const getCountryName = (languageCode) => {
    const languageToCountry = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      zh: "Chinese",
      hi: "Hindi",
    };
    return languageToCountry[languageCode] || languageCode;
  };

  return (
    <Link
      href={`/community/${member.userId}`}
      className="bg-white border rounded-lg p-3 flex items-center space-x-4 hover:shadow-lg transition-shadow"
    >
      <img
        src={`${baseUrl}${member.profilePicture}`}
        alt={member.name}
        className="w-28 h-28 rounded-lg object-cover"
        onError={(e) => {
          e.target.src = defaultImage;
        }}
      />
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <span
            className={`block w-3 h-3 rounded-full ${
              member.status === "online" ? "bg-green-400" : "bg-red-400"
            }`}
          ></span>
          <h3 className="font-semibold text-lg">{member.name}</h3>
        </div>
        <p className="text-sm text-gray-600">{member.description}</p>

        {/* Conditionally render "Speaks" section */}
        {member.speaks && member.speaks.length > 0 && (
          <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
            <div className="flex gap-2 items-center">
              <span className="font-medium text-black">SPEAKS</span>
              {member.speaks.map((lang, index) => (
                <span key={index} className="ml-1">
                  {getCountryName(lang)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Conditionally render "Learns" section */}
        {member.learns && member.learns.length > 0 && (
          <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
            <div className="flex gap-2 items-center">
              <span className="font-medium text-black">LEARNS</span>
              {member.learns.map((lang, index) => (
                <span key={index} className="ml-1">
                  {getCountryName(lang)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

// Search bar for filtering members
const SearchBar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="flex items-center gap-4 max-w-md">
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
      <button className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
        <FiSliders className="text-gray-500" />
      </button>
    </div>
  );
};

const MembersGrid = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("All members");
  const [currentUserLocation, setCurrentUserLocation] = useState(null);

  // Fetch members and current user's profile
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("token");
        // Fetch all members
        const membersResponse = await axios.get(
          `${apiUrl}/profile/all/members`
        );
        setMembers(membersResponse.data);
        setFilteredMembers(membersResponse.data);

        // Fetch current user's profile to get their location
        const userProfileResponse = await axios.get(
          `${apiUrl}/profile/my/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        setCurrentUserLocation(
          userProfileResponse.data?.location?.toLowerCase()
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter members based on active tab
  useEffect(() => {
    if (!members.length || !currentUserLocation) return;

    switch (activeTab) {
      case "Near me":
        const nearbyMembers = members.filter(
          (member) => member.location?.toLowerCase() === currentUserLocation
        );
        setFilteredMembers(nearbyMembers);
        break;

      case "Travel":
        const travelMembers = members.filter(
          (member) => member.location?.toLowerCase() !== currentUserLocation
        );
        setFilteredMembers(travelMembers);
        break;

      default: // "All members"
        setFilteredMembers(members);
        break;
    }
  }, [activeTab, members, currentUserLocation]);

  // Handle search
  const handleSearch = async (query) => {
    if (query) {
      try {
        const token = Cookies.get("token");
        const response = await axios.get(
          `${apiUrl}/partners/search?query=${query}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        setFilteredMembers(response.data);
      } catch (error) {
        console.error("Error fetching search results:", error);
        setError("Failed to fetch search results. Please try again later.");
      }
    } else {
      // When clearing search, respect the active tab filter
      if (activeTab === "Near me") {
        setFilteredMembers(
          members.filter(
            (member) => member.location?.toLowerCase() === currentUserLocation
          )
        );
      } else if (activeTab === "Travel") {
        setFilteredMembers(
          members.filter(
            (member) => member.location?.toLowerCase() !== currentUserLocation
          )
        );
      } else {
        setFilteredMembers(members);
      }
    }
  };

  // Tabs component with proper state management
  const Tabs = () => {
    const tabs = [
      { name: "All members", icon: "🔍" },
      { name: "Near me", icon: "📍" },
      { name: "Travel", icon: "✈️" },
    ];

    return (
      <div className="flex gap-5 py-7">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
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

  let content;
  if (loading) {
    content = <p>Loading...</p>;
  } else if (error) {
    content = <p>{error}</p>;
  } else if (filteredMembers.length === 0) {
    content = (
      <p className="text-center text-gray-500 mt-4">
        {activeTab === "Near me"
          ? "No members found in your location."
          : activeTab === "Travel"
          ? "No members found from other locations."
          : "No members found."}
      </p>
    );
  } else {
    content = (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => (
          <MemberCard member={member} key={member._id} />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen">
      <div className="max-w-[1450px] mx-auto">
        <div className="flex items-center justify-between">
          <Tabs />
          <SearchBar onSearch={handleSearch} />
        </div>
        {content}
        <HighlightedProfiles />
      </div>
    </div>
  );
};

export default MembersGrid;
