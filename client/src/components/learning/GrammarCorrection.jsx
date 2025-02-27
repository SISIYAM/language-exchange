"use client";
import React, { useState } from "react";
import { FaCheck, FaSpinner } from "react-icons/fa";

const GrammarCorrection = () => {
  const [text, setText] = useState("");
  const [corrections, setCorrections] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");

  const languages = [
    { code: "en-US", name: "English (US)" },
    { code: "en-GB", name: "English (UK)" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
  ];

  const checkGrammar = async () => {
    if (!text.trim()) return;

    setIsChecking(true);
    try {
      const response = await fetch("/api/learning/check-grammar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          language: selectedLanguage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setCorrections(data);
    } catch (error) {
      console.error("Error checking grammar:", error);
      setCorrections({
        matches: [],
        error: "Failed to check grammar. Please try again.",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const applySuggestion = (correction) => {
    const before = text.substring(0, correction.offset);
    const after = text.substring(correction.offset + correction.length);
    setText(before + correction.replacements[0].value + after);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Grammar & Writing Correction</h2>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Language:
        </label>
        <select
          className="w-full p-2 border rounded"
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Your Text:
        </label>
        <textarea
          className="w-full p-2 border rounded"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your text here..."
          rows="6"
        />
      </div>

      <button
        onClick={checkGrammar}
        disabled={isChecking || !text.trim()}
        className="flex items-center justify-center w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {isChecking ? (
          <>
            <FaSpinner className="animate-spin mr-2" /> Checking...
          </>
        ) : (
          <>
            <FaCheck className="mr-2" /> Check Grammar & Style
          </>
        )}
      </button>

      {corrections && (
        <div className="mt-6">
          <h3 className="font-bold mb-3">Suggestions:</h3>
          {corrections.matches.length > 0 ? (
            <div className="space-y-4">
              {corrections.matches.map((correction, index) => (
                <div key={index} className="p-3 border rounded bg-yellow-50">
                  <p className="text-red-500 mb-1">{correction.message}</p>
                  <p className="text-gray-600 mb-2">
                    Context: "...
                    {text.substring(
                      Math.max(0, correction.offset - 20),
                      Math.min(
                        text.length,
                        correction.offset + correction.length + 20
                      )
                    )}
                    ..."
                  </p>
                  {correction.replacements.length > 0 && (
                    <button
                      onClick={() => applySuggestion(correction)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Replace with: {correction.replacements[0].value}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-green-500">No grammar or style issues found!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GrammarCorrection;
