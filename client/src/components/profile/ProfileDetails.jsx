"use client";
import Link from "next/link";
import React from "react";
import { useEffect, useState } from "react";
import { CiMenuKebab } from "react-icons/ci";

const ProfileDetails = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/profile/me", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          console.error("Failed to fetch profile data");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>No profile data found.</div>;

  // Calculate age from dateOfBirth
  const calculateAge = (birthDate) => {
    const diff = Date.now() - new Date(birthDate).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

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
            src={profile.profilePicture}
            alt="Profile"
            className="w-44 h-44 rounded-full border-4 border-white object-cover"
          />
          <h1 className="mt-3 text-2xl font-semibold">
            {profile.name}, {calculateAge(profile.dateOfBirth)}
          </h1>
          <p className="text-gray-500">Active recently</p>
          <div className="flex justify-center space-x-4 mt-4">
            <button className="bg-primary text-white px-6 py-2 rounded-full">
              Follow
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
              <h3 className="font-semibold text-sm">PRIMARY</h3>
              <p className="text-gray-700 flex items-center">
                <span className="mr-2">🌐</span>
                {profile.language} ({profile.proficiencyLevel})
              </p>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="bg-white border p-4 rounded-lg">
          <h2 className="font-bold mb-2">About {profile.name.split(",")[0]}</h2>
          <p className="text-sm text-gray-600 flex items-center mb-1">
            <span className="mr-2">📍</span>
            {profile.location || "Location not specified"}
          </p>
          <p className="text-sm text-gray-600 flex items-center mb-1">
            <span className="mr-2">🆔</span>@{profile.tandemID}
          </p>

          <h3 className="font-semibold mt-4">Language Proficiency</h3>
          <p className="text-gray-700 capitalize">
            {profile.proficiencyLevel.toLowerCase()}
          </p>

          <h3 className="font-semibold mt-4">Learning Preferences</h3>
          <p className="text-gray-700">
            {profile.showLocation ? "Shares location" : "Hides location"}
          </p>
        </section>

        <section>
          {/* Topics Section */}
          <section className="bg-white border p-4 rounded-lg">
            <h2 className="font-bold mb-2">Topics of Interest</h2>
            <div className="flex flex-wrap gap-2">
              {profile.topics?.map((topic, index) => (
                <span
                  key={index}
                  className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                >
                  {topic}
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
                    src={profile.profilePicture}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded"
                  />
                ))}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
};

export default ProfileDetails;
