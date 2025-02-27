"use client";
import React, { useState, useRef, useEffect } from "react";
import { FaMicrophone, FaStop, FaPaperPlane } from "react-icons/fa";

const AIChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [selectedTopic, setSelectedTopic] = useState("general");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const chatContainerRef = useRef(null);

  const languages = [
    { value: "english", label: "English" },
    { value: "spanish", label: "Spanish" },
    { value: "french", label: "French" },
    { value: "german", label: "German" },
    { value: "italian", label: "Italian" },
  ];

  const topics = [
    { value: "general", label: "General Conversation" },
    { value: "business", label: "Business" },
    { value: "travel", label: "Travel" },
    { value: "food", label: "Food & Dining" },
    { value: "culture", label: "Culture" },
  ];

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        await processAudioToText(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudioToText = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob);
      formData.append("language", selectedLanguage);

      const response = await fetch("/api/learning/speech-to-text", {
        method: "POST",
        body: formData,
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
      if (data.text) {
        setInputText(data.text);
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      setInputText("");
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessage = {
      text: inputText,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");

    try {
      const response = await fetch("/api/learning/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputText,
          language: selectedLanguage,
          topic: selectedTopic,
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

      setMessages((prev) => [
        ...prev,
        {
          text: data.response,
          sender: "bot",
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, I encountered an error. Please try again.",
          sender: "bot",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Practice Conversation</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Language:
          </label>
          <select
            className="w-full p-2 border rounded"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Topic:
          </label>
          <select
            className="w-full p-2 border rounded"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
          >
            {topics.map((topic) => (
              <option key={topic.value} value={topic.value}>
                {topic.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        ref={chatContainerRef}
        className="h-96 overflow-y-auto mb-4 p-4 border rounded"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.sender === "user" ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block p-3 rounded-lg ${
                message.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {message.text}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <div className="flex space-x-2">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-2 rounded ${
            isRecording ? "bg-red-500" : "bg-blue-500"
          } text-white`}
        >
          {isRecording ? <FaStop /> : <FaMicrophone />}
        </button>

        <input
          type="text"
          className="flex-1 p-2 border rounded"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message..."
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          onClick={sendMessage}
          className="p-2 bg-blue-500 text-white rounded"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default AIChatbot;
