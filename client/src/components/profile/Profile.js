"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AiTwotoneEdit } from "react-icons/ai";
import Cookies from "js-cookie";
import { fetchProfile, updateProfile } from "@/features/user/profileSlice";
import { fetchLoggedInUser } from "@/features/user/userSlice";
import { useRouter } from "next/navigation";
import { logout } from "@/features/user/userSlice";
import toast from "react-hot-toast";

const ProfileForm = () => {
  const dispatch = useDispatch();
  const { profile, status, error } = useSelector((state) => state.profile);
  const { currentUser } = useSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

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
    nativeLanguage: "",
    fluentLanguage: "",
    learningLanguage: "",
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
    const fetchData = async () => {
      try {
        await dispatch(fetchLoggedInUser()).unwrap();
        await dispatch(fetchProfile()).unwrap();
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [dispatch]);

  // Populate form data with fetched profile and user data
  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        name: profile.name || "",
        tandemID: profile.tandemID || "",
        dob: profile.dateOfBirth
          ? new Date(profile.dateOfBirth).toISOString().split("T")[0]
          : "",
        location: profile.location || "",
        about: profile.about || "",
        partnerPreference: profile.partnerPreference || "",
        learningGoals: profile.learningGoals || "",
        nativeLanguage: profile.nativeLanguage || "",
        fluentLanguage: profile.fluentLanguage || "",
        learningLanguage: profile.learningLanguage || "",
        translateLanguage: profile.translateLanguage || "",
        communication: profile.communication || "Not set",
        timeCommitment: profile.timeCommitment || "Not set",
        learningSchedule: profile.learningSchedule || "Not set",
        correctionPreference: profile.correctionPreference || "Not set",
        topics: profile.topics || ["Life"],
        showLocation: profile.showLocation ?? true,
        showTandemID: profile.showTandemID ?? true,
        notifications: profile.notifications ?? true,
        profilePicture: profile.profilePicture || "",
      }));
    }
  }, [profile]);

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

  const handleSave = async () => {
    setIsLoading(true);
    setSaveError(null);
    setSuccessMessage("");

    try {
      const token = Cookies.get("token");
      if (!token) {
        throw new Error("No token found. Please log in again.");
      }

      await dispatch(updateProfile(formData)).unwrap();
      setSuccessMessage("Profile saved successfully!");

      // Refresh profile data
      await dispatch(fetchProfile()).unwrap();
    } catch (error) {
      console.error("Error saving profile:", error);
      setSaveError(
        error.message || "An error occurred while saving the profile."
      );
    } finally {
      setIsLoading(false);
    }
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

  const handleMenuItemClick = async (label) => {
    if (label === "Log out") {
      try {
        await dispatch(logout()).unwrap();
        toast.success("Logged out successfully");
        router.push("/login");
      } catch (error) {
        toast.error(error.message || "Failed to logout");
      }
    } else {
      setActiveTab(label);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "About me":
        return (
          <div className="space-y-6">
            <div className="flex items-end mb-8">
              <div className="relative">
                <img
                  src={
                    formData.profilePicture
                      ? `http://localhost:8080${formData.profilePicture}`
                      : "/default-avatar.png"
                  }
                  alt="Profile"
                  className="rounded-full w-44 h-44 object-cover border border-gray-300"
                />
                <label
                  htmlFor="profile-picture-input"
                  className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-100"
                >
                  <AiTwotoneEdit size={20} />
                </label>
                <input
                  id="profile-picture-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePictureChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            {saveError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {saveError}
              </div>
            )}
            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                {successMessage}
              </div>
            )}

            <div className="space-y-4">
              <FormField
                label="Name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
              <FormField
                label="Tandem ID"
                value={formData.tandemID}
                onChange={(e) => handleInputChange("tandemID", e.target.value)}
                required
              />
              <FormField
                label="Date of Birth"
                type="date"
                value={formData.dob}
                onChange={(e) => handleInputChange("dob", e.target.value)}
                required
              />
              <FormField
                label="Location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                required
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
                Account Actions
              </h3>
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => handleMenuItemClick("Log out")}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 w-full"
                >
                  Log Out
                </button>
                <button className="border border-red-500 text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 w-full">
                  Delete Account
                </button>
              </div>
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

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSaveError("Please upload an image file");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setSaveError("Image size should be less than 5MB");
      return;
    }

    try {
      setIsLoading(true);
      setSaveError(null);
      const formData = new FormData();
      formData.append("profilePicture", file);

      const token = Cookies.get("token");
      if (!token) {
        throw new Error("No token found. Please log in again.");
      }

      // Note: Don't set Content-Type header, let the browser set it with the boundary
      const response = await fetch(
        "http://localhost:8080/api/profile/upload-picture",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload image");
      }

      const data = await response.json();

      // Update the form data with the new image URL
      setFormData((prev) => ({
        ...prev,
        profilePicture: data.imageUrl,
      }));

      setSuccessMessage("Profile picture updated successfully!");

      // Refresh profile data
      await dispatch(fetchProfile()).unwrap();
    } catch (error) {
      console.error("Profile picture upload error:", error);
      setSaveError(error.message || "Failed to upload profile picture");
    } finally {
      setIsLoading(false);
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
                  onClick={() => handleMenuItemClick(item.label)}
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
const FormField = ({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}) => (
  <div className="border-b py-4">
    <label className="block text-lg font-semibold mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      required={required}
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
