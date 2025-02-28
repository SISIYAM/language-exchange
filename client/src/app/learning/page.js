"use client";
import React, { useState } from "react";
import SpeechRecognition from "@/components/learning/SpeechRecognition";
import AIChatbot from "@/components/learning/AIChatbot";
import GrammarCorrection from "@/components/learning/GrammarCorrection";

const LearningPage = () => {
  const [activeTab, setActiveTab] = useState("pronunciation");

  const tabs = [
    {
      id: "conversation",
      label: "Practice Conversations",
      description:
        "Have real conversations with AI tutors in different languages.",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Learning Resources
      </h1>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`p-4 rounded-lg text-left transition-all ${
              activeTab === tab.id
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-800 hover:bg-gray-100"
            }`}
          >
            <h3 className="font-bold text-lg mb-2">{tab.label}</h3>
            <p
              className={`text-sm ${
                activeTab === tab.id ? "text-blue-100" : "text-gray-600"
              }`}
            >
              {tab.description}
            </p>
          </button>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        {/* {activeTab === "pronunciation" && <SpeechRecognition />} */}
        {activeTab === "conversation" && <AIChatbot />}
        {/* {activeTab === "grammar" && <GrammarCorrection />} */}
      </div>
    </div>
  );
};

export default LearningPage;
