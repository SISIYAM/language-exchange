"use client";
import React, { useState } from "react";
import SpeechRecognition from "@/components/learning/SpeechRecognition";
import AIChatbot from "@/components/learning/AIChatbot";
import GrammarCorrection from "@/components/learning/GrammarCorrection";

const LearningPage = () => {
  const [activeTab, setActiveTab] = useState("pronunciation");

  const tabs = [
    {
      id: "pronunciation",
      label: "Talk To Enlighten",
      description: "Have real conversations with AI tutors.",
    },
    {
      id: "conversation",
      label: "Translate Your Thoughts",
      description: "Translate your thoughts into different languages.",
    },
    {
      id: "grammar",
      label: "Grammar Correction",
      description: "Correct your grammar mistakes.",
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
                ? "bg-green-500 text-white"
                : "bg-white text-gray-800 hover:bg-gray-100"
            }`}
          >
            <h3 className="font-bold text-lg mb-2">{tab.label}</h3>
            <p
              className={`text-sm ${
                activeTab === tab.id ? "text-green-100" : "text-gray-600"
              }`}
            >
              {tab.description}
            </p>
          </button>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        {activeTab === "pronunciation" && <SpeechRecognition />}
        {activeTab === "conversation" && <AIChatbot />}
        {activeTab === "grammar" && <GrammarCorrection />}
      </div>
    </div>
  );
};

export default LearningPage;
