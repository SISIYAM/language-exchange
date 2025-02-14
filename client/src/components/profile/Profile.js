"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AiTwotoneEdit } from "react-icons/ai";
import Cookies from "js-cookie";
import { fetchProfile, updateProfile } from "@/features/user/profileSlice";
import { fetchLoggedInUser } from "@/features/user/userSlice";

const ProfileForm = () => {
  const dispatch = useDispatch();
  const { profile, status, error } = useSelector((state) => state.profile);
  const { currentUser } = useSelector((state) => state.user);

  const [activeTab, setActiveTab] = useState("About me");
  const [formData, setFormData] = useState({
    // About Me
    name: "",
    tandemID: "",
    dob: "",
    location: "",
    about: "",
    partnerPreference: "",
    learningGoals: "",

    // Languages
    nativeLanguage: "English (English)",
    fluentLanguage: "French (Français)",
    learningLanguage: "Chinese (Traditional) (中文 (繁體))",
    translateLanguage: "",

    // Learning Preferences
    communication: "Not set",
    timeCommitment: "Not set",
    learningSchedule: "Not set",
    correctionPreference: "Not set",

    // Topics
    topics: ["Life"],
    newTopic: "",

    // Settings
    showLocation: true,
    showTandemID: true,
    notifications: true,

    // Following
    followingTab: "Following",

    // Profile Picture
    profilePicture: "",
  });

  // Fetch profile and user data on component mount
  useEffect(() => {
    dispatch(fetchLoggedInUser());
    dispatch(fetchProfile());
  }, [dispatch]);

  // Populate form data with fetched profile and user data
  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        name: profile.name || prev.name,
        tandemID: profile.tandemID || prev.tandemID,
        dob:
          profile.dob && !isNaN(new Date(profile.dob))
            ? new Date(profile.dob).toISOString().split("T")[0]
            : prev.dob, // Only format if dob is valid
        location: profile.location || prev.location,
        about: profile.about || prev.about,
        partnerPreference: profile.partnerPreference || prev.partnerPreference,
        learningGoals: profile.learningGoals || prev.learningGoals,
        nativeLanguage: profile.nativeLanguage || "",
        fluentLanguage: profile.fluentLanguage || "",
        learningLanguage: profile.learningLanguage || "",
        translateLanguage: profile.translateLanguage || prev.translateLanguage,
        communication: profile.communication || "Not set",
        timeCommitment: profile.timeCommitment || "Not set",
        learningSchedule: profile.learningSchedule || "Not set",
        correctionPreference: profile.correctionPreference || "Not set",
        topics: profile.topics || [""],
        showLocation:
          profile.showLocation !== undefined ? profile.showLocation : true,
        showTandemID:
          profile.showTandemID !== undefined ? profile.showTandemID : true,
        notifications:
          profile.notifications !== undefined ? profile.notifications : true,
        profilePicture: profile.profilePicture || prev.profilePicture,
      }));
    }
    // Populate the form with the logged-in user's name if available
    if (currentUser) {
      console.log("Current user:", currentUser);
      setFormData((prev) => ({
        ...prev,
        name: currentUser.name || prev.name,
        tandemID: currentUser.tandemID || prev.tandemID, // Avoid overwriting if already set
        dob: currentUser.dob
          ? new Date(currentUser.dob).toISOString().split("T")[0]
          : prev.dob, // Format dob
        profilePicture: currentUser.image || prev.profilePicture,
      }));
    }

    console.log("FormData State:", formData); // Log to check if data is being populated correctly
  }, [profile, currentUser]);

  const menuItems = [
    { label: "About me" },
    { label: "Languages" },
    { label: "Learning Preferences" },
    { label: "Topics" },
    { label: "Following" },
    { label: "Settings" },
    { label: "Visitors" },
    { label: "Log out" },
  ];

  const handleSave = () => {
    const token = Cookies.get("token");

    if (!token) {
      alert("No token found. Please log in again.");
      return;
    }

    // Dispatch the updateProfile action with formData
    dispatch(updateProfile(formData))
      .unwrap()
      .then(() => {
        alert("Profile saved successfully!");
      })
      .catch((error) => {
        // Log the error object for detailed debugging
        console.error("Error saving profile:", error);

        // Display a more detailed error message to the user
        const errorMessage =
          error.message || "An error occurred while saving the profile.";
        alert(errorMessage);
      });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const ToggleSwitch = ({ isOn, handleToggle }) => (
    <div
      className={`relative inline-block w-10 h-6 rounded-full cursor-pointer transition-colors ${
        isOn ? "bg-blue-500" : "bg-gray-300"
      }`}
      onClick={handleToggle}
    >
      <div
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
          isOn ? "transform translate-x-4" : ""
        }`}
      />
    </div>
  );

  const handleAddTopic = () => {
    if (formData.newTopic.trim()) {
      setFormData((prev) => ({
        ...prev,
        topics: [...prev.topics, prev.newTopic.trim()],
        newTopic: "",
      }));
    }
  };

  const handleRemoveTopic = (topicToRemove) => {
    setFormData((prev) => ({
      ...prev,
      topics: prev.topics.filter((topic) => topic !== topicToRemove),
    }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "About me":
        return (
          <div className="space-y-6">
            <div className="flex items-end mb-8">
              <div className="relative">
                <img
                  src={formData.profilePicture}
                  alt="Profile"
                  className="rounded-full w-44 h-44 object-cover border border-gray-300"
                />
                <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg">
                  <AiTwotoneEdit size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <FormField
                label="Name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
              <FormField
                label="Tandem ID"
                value={formData.tandemID}
                onChange={(e) => handleInputChange("tandemID", e.target.value)}
              />
              <FormField
                label="Date of Birth"
                type="date"
                value={formData.dob}
                onChange={(e) => handleInputChange("dob", e.target.value)}
              />
              <FormField
                label="Location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
              />
            </div>

            <div className="space-y-6 mt-8">
              <TextAreaField
                label="What do you like to talk about?"
                value={formData.about}
                onChange={(e) => handleInputChange("about", e.target.value)}
              />
              <TextAreaField
                label="What's your ideal language exchange partner like?"
                value={formData.partnerPreference}
                onChange={(e) =>
                  handleInputChange("partnerPreference", e.target.value)
                }
              />
              <TextAreaField
                label="What are your language learning goals?"
                value={formData.learningGoals}
                onChange={(e) =>
                  handleInputChange("learningGoals", e.target.value)
                }
              />
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Photos</h3>
              <div className="grid grid-cols-5 gap-4">
                {Array(5)
                  .fill()
                  .map((_, index) => (
                    <div
                      key={index}
                      className="border-2 border-dashed border-gray-300 rounded-lg h-24 flex items-center justify-center"
                    >
                      <span className="text-gray-400 text-xl">+</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        );

      case "Languages":
        return (
          <div className="space-y-6">
            <LanguageFormSection
              title="I am native in"
              value={formData.nativeLanguage}
              onChange={(e) =>
                handleInputChange("nativeLanguage", e.target.value)
              }
            />
            <LanguageFormSection
              title="I am fluent in"
              value={formData.fluentLanguage}
              onChange={(e) =>
                handleInputChange("fluentLanguage", e.target.value)
              }
            />
            <LanguageFormSection
              title="I am learning"
              value={formData.learningLanguage}
              onChange={(e) =>
                handleInputChange("learningLanguage", e.target.value)
              }
            />
            <div className="border-b py-4">
              <h3 className="font-semibold text-lg mb-4">
                Translate incoming messages to
              </h3>
              <select
                value={formData.translateLanguage}
                onChange={(e) =>
                  handleInputChange("translateLanguage", e.target.value)
                }
                className="w-full p-2 border rounded-lg"
              >
                <option value="">No languages selected</option>
                <option value="English">English</option>
                <option value="French">French</option>
                <option value="Chinese">Chinese</option>
              </select>
            </div>
          </div>
        );

      case "Learning Preferences":
        return (
          <div className="space-y-6">
            <PreferenceField
              title="Communication"
              value={formData.communication}
              onChange={(e) =>
                handleInputChange("communication", e.target.value)
              }
              options={["Text Chat", "Voice Messages", "Video Calls"]}
            />
            <PreferenceField
              title="Time Commitment"
              value={formData.timeCommitment}
              onChange={(e) =>
                handleInputChange("timeCommitment", e.target.value)
              }
              options={["1-2 hours/week", "3-5 hours/week", "5+ hours/week"]}
            />
            <PreferenceField
              title="Learning Schedule"
              value={formData.learningSchedule}
              onChange={(e) =>
                handleInputChange("learningSchedule", e.target.value)
              }
              options={["Morning", "Afternoon", "Evening", "Flexible"]}
            />
            <PreferenceField
              title="Correction Preference"
              value={formData.correctionPreference}
              onChange={(e) =>
                handleInputChange("correctionPreference", e.target.value)
              }
              options={[
                "Correct me immediately",
                "Correct me after conversation",
                "Only when asked",
              ]}
            />
          </div>
        );

      case "Topics":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Topics</h3>
              <div className="flex items-center gap-2">
                <input
                  value={formData.newTopic}
                  onChange={(e) =>
                    handleInputChange("newTopic", e.target.value)
                  }
                  className="border rounded-lg px-3 py-1 w-48"
                  placeholder="New topic"
                />
                <button
                  onClick={handleAddTopic}
                  className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
            </div>
            <div className="border-t pt-4">
              {formData.topics.map((topic) => (
                <div
                  key={topic}
                  className="flex justify-between items-center py-2 border-b"
                >
                  <span className="text-gray-700">{topic}</span>
                  <button
                    onClick={() => handleRemoveTopic(topic)}
                    className="text-red-500 hover:text-red-700 text-xl"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case "Following":
        return (
          <div className="space-y-6">
            <div className="flex border-b">
              {["Following", "Followers", "Blocked"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleInputChange("followingTab", tab)}
                  className={`px-6 py-3 font-medium ${
                    formData.followingTab === tab
                      ? "border-b-2 border-blue-500 text-blue-500"
                      : "text-gray-500 hover:text-blue-400"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="py-6 text-gray-500">
              {formData.followingTab === "Following" &&
                "You are not following anyone yet"}
              {formData.followingTab === "Followers" &&
                "You have no followers yet"}
              {formData.followingTab === "Blocked" &&
                "You haven't blocked anyone yet"}
            </div>
          </div>
        );

      case "Settings":
        return (
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Privacy</h3>
              <ToggleSection
                label="Show my location"
                checked={formData.showLocation}
                onChange={() =>
                  handleInputChange("showLocation", !formData.showLocation)
                }
              />
              <ToggleSection
                label="Show my Tandem ID"
                checked={formData.showTandemID}
                onChange={() =>
                  handleInputChange("showTandemID", !formData.showTandemID)
                }
              />
              <div className="flex justify-between items-center py-2">
                <span>Manage Cookies</span>
                <button className="text-blue-500 hover:text-blue-700">
                  Manage Cookies
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Notifications</h3>
              <ToggleSection
                label="Receive notifications for messages or calls"
                checked={formData.notifications}
                onChange={() =>
                  handleInputChange("notifications", !formData.notifications)
                }
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Download your data</h3>
              <p className="text-gray-500 mb-2">
                You can download your Tandem personal data here.
              </p>
              <button className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300">
                Request data
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-red-500">
                Delete account
              </h3>
              <p className="text-gray-500">
                This action cannot be undone. All your data will be permanently
                deleted.
              </p>
              <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                Delete Account
              </button>
            </div>
          </div>
        );
      case "Visitors":
        return (
          <div className="space-y-4">
            <p className="text-gray-600">
              You had 1 new visitor to your profile last week. Upgrade to Tandem
              Pro to connect with them.
            </p>
            <button className="bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600">
              SEE YOUR VISITORS
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-12">
      <div className="w-full max-w-[1300px] mx-auto">
        <div className="bg-white rounded-lg border flex md:flex-row flex-col p-6">
          {/* Sidebar */}
          <div className="md:w-1/4 border-r pr-6">
            <ul className="flex md:flex-col flex-row items-start gap-5 text-base">
              {menuItems.map((item, index) => (
                <li
                  key={index}
                  className={`${
                    activeTab === item.label
                      ? "md:bg-gray-200 text-blue-500"
                      : "text-[#222]"
                  } rounded-full px-7 py-2 cursor-pointer transition-all`}
                  onClick={() => setActiveTab(item.label)}
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Main Content */}
          <div className="md:w-3/4 md:pl-6">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-semibold">Edit Profile</h1>
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>

            {status === "loading" && <p>Loading...</p>}
            {status === "failed" && (
              <p className="text-red-500">
                {typeof error === "object" ? JSON.stringify(error) : error}
              </p>
            )}

            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Components
const FormField = ({ label, value, onChange, type = "text" }) => (
  <div className="border-b py-4">
    <label className="block text-lg font-semibold mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
);

const TextAreaField = ({ label, value, onChange }) => (
  <div className="border-b py-4">
    <label className="block text-lg font-semibold mb-2">{label}</label>
    <textarea
      value={value}
      onChange={onChange}
      className="w-full p-2 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
);

const LanguageFormSection = ({ title, value, onChange }) => (
  <div className="border-b py-4">
    <h3 className="font-semibold text-lg mb-4">{title}</h3>
    <select
      value={value}
      onChange={onChange}
      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
    >
      <option>English (English)</option>
      <option>French (Français)</option>
      <option>Chinese (Traditional) (中文 (繁體))</option>
    </select>
  </div>
);

const PreferenceField = ({ title, value, onChange, options }) => (
  <div className="border-b py-4">
    <h3 className="font-semibold text-lg mb-2">{title}</h3>
    <select
      value={value}
      onChange={onChange}
      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
    >
      <option value="Not set">Not set</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);
const ToggleSection = ({ label, checked, onChange }) => (
  <div className="flex justify-between items-center py-2">
    <span>{label}</span>
    <div
      className={`relative inline-block w-10 h-6 rounded-full cursor-pointer ${
        checked ? "bg-blue-500" : "bg-gray-300"
      }`}
      onClick={onChange}
    >
      <div
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
          checked ? "translate-x-4" : ""
        }`}
      />
    </div>
  </div>
);

export default ProfileForm;
