"use client";
import Link from "next/link";
import React from "react";
import { useEffect, useState } from "react";
import { CiMenuKebab } from "react-icons/ci";
import axios from "axios";
import Cookies from "js-cookie"; // Import Cookies for token management

// Define the API base URL
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
console.log(baseUrl);

const defaultImage =
  "https://imgs.search.brave.com/m12gFeEaYTH9TW9JHo1E4K4UFZBIAGpFdv-O_jdbty0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzAzLzQ2LzgzLzk2/LzM2MF9GXzM0Njgz/OTY4M182bkFQemJo/cFNrSXBiOHBtQXd1/ZmtDN2M1ZUQ3d1l3/cy5qcGc";

const ProfileDetails = ({ id }) => {
  const [profile, setProfile] = useState(null);
  const [myProfile, setMyProfile] = useState(null); // State to store the current user's profile
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false); // Track follow/unfollow state

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = Cookies.get("token"); // Get the token from cookies

        // Fetch the profile being viewed
        const profileResponse = await axios.get(`${apiUrl}/profile/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the headers
          },
          withCredentials: true,
        });

        // Fetch the current user's profile
        const myProfileResponse = await axios.get(
          `${apiUrl}/profile/my/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the token in the headers
            },
            withCredentials: true,
          }
        );

        if (profileResponse.data && myProfileResponse.data) {
          setProfile(profileResponse.data.profile); // Access the profile object directly
          setMyProfile(myProfileResponse.data.profile); // Access the profile object directly

          // Check if the current user is already following this profile

          const isFollowingProfile =
            myProfileResponse.data.following.includes(id);
          setIsFollowing(isFollowingProfile);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to fetch profile data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  // Function to handle follow/unfollow
  const handleFollow = async () => {
    try {
      const token = Cookies.get("token"); // Get the token from cookies
      const endpoint = isFollowing
        ? `${apiUrl}/profile/unfollow/${id}`
        : `${apiUrl}/profile/follow/${id}`;

      const response = await axios.post(
        endpoint,
        {}, // No body needed for this request
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the headers
          },
          withCredentials: true,
        }
      );

      if (response.data) {
        setIsFollowing(!isFollowing); // Toggle follow/unfollow state
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      setError("Failed to toggle follow. Please try again later.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!profile) return <div>No profile data found.</div>;

  // Calculate age from dateOfBirth
  const calculateAge = (birthDate) => {
    if (!birthDate) return "Unknown"; // Handle null or undefined dateOfBirth
    const diff = Date.now() - new Date(birthDate).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  // Destructure profile from the response
  const profileData = profile;

  return (
    <div className="min-h-screen bg-amber-50/80">
      {/* Header Section */}
      <header className="relative bg-blue-100">
        <img
          src="https://app.tandem.net/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fprofile-map-hero.5169a879.png&w=1920&q=75"
          alt="World Map"
          className="w-full h-64 object-cover"
        />
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-5 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-3 top-1/2 flex flex-col items-center left-1/2 transform -translate-y-20 text-center">
          <img
            src={
              profileData.profilePicture
                ? `${baseUrl}${profileData.profilePicture}`
                : defaultImage
            }
            alt="Profile"
            className="w-44 h-44 rounded-full border-4 border-white object-cover"
          />
          <h1 className="mt-3 text-2xl font-semibold">
            {profileData.name}, {calculateAge(profileData.dateOfBirth)}
          </h1>
          <p className="text-gray-500">Active recently</p>
          <div className="flex justify-center space-x-4 mt-4">
            <button
              onClick={handleFollow}
              className="bg-primary text-white px-6 py-2 rounded-full"
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
            <Link href="/chat">
              <button className="bg-primary text-white px-6 py-2 rounded-full">
                Message
              </button>
            </Link>
            <CiMenuKebab
              size={40}
              className="bg-gray-50 border text-primary border-primary p-2 rounded-full"
            />
          </div>
        </div>

        {/* Languages Section */}
        <section className="bg-white border p-4 rounded-lg">
          <h2 className="font-bold mb-2">Languages</h2>
          <div className="space-y-2">
            <div>
              <h3 className="font-semibold text-sm">NATIVE</h3>
              <p className="text-gray-700 flex items-center">
                <span className="mr-2">🌐</span>
                {profileData.nativeLanguage || "Not specified"}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm">FLUENT</h3>
              <p className="text-gray-700 flex items-center">
                <span className="mr-2">🌐</span>
                {profileData.fluentLanguage || "Not specified"}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm">LEARNING</h3>
              <p className="text-gray-700 flex items-center">
                <span className="mr-2">🌐</span>
                {profileData.learningLanguage || "Not specified"}
              </p>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="bg-white border p-4 rounded-lg">
          <h2 className="font-bold mb-2">
            About {profileData.name.split(" ")[0]}
          </h2>
          <p className="text-sm text-gray-600 flex items-center mb-1">
            <span className="mr-2">📍</span>
            {profileData.location || "Location not specified"}
          </p>
          <p className="text-sm text-gray-600 flex items-center mb-1">
            <span className="mr-2">🆔</span>@{profileData.tandemID}
          </p>

          <h3 className="font-semibold mt-4">Description</h3>
          <p className="text-gray-700">
            {profileData.description || "No description provided."}
          </p>

          <h3 className="font-semibold mt-4">Learning Goals</h3>
          <p className="text-gray-700">
            {profileData.learningGoals || "Not specified"}
          </p>

          <h3 className="font-semibold mt-4">Partner Preference</h3>
          <p className="text-gray-700">
            {profileData.partnerPreference || "Not specified"}
          </p>
        </section>

        {/* Topics Section */}
        <section className="bg-white border p-4 rounded-lg">
          <h2 className="font-bold mb-2">Topics of Interest</h2>
          <div className="flex flex-wrap gap-2">
            {profileData.topics?.map((topic, index) => (
              <span
                key={index}
                className="bg-gray-100 px-3 py-1 rounded-full text-sm"
              >
                {topic || "No topics specified"}
              </span>
            ))}
          </div>
        </section>

        {/* Photos Section */}
        <section className="col-span-1 border md:col-span-3 mt-4 bg-white p-4 rounded-lg">
          <h2 className="font-bold mb-2">Photos</h2>
          <div className="grid grid-cols-3 gap-2">
            {Array(6)
              .fill()
              .map((_, index) => (
                <img
                  key={index}
                  src={
                    `${baseUrl}${profileData.profilePicture}` ||
                    "/default-profile.png"
                  }
                  alt={`Photo ${index + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
              ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProfileDetails;
