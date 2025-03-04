import React, { useState, useRef, useEffect } from "react";
import { FaPaperPlane } from "react-icons/fa";

const AIChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [selectedTopic, setSelectedTopic] = useState("general");
  const [translationLanguage, setTranslationLanguage] = useState("english");
  const chatContainerRef = useRef(null);

  const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "it", label: "Italian" },
    { value: "bn", label: "Bengali" },
    { value: "zh", label: "Chinese" },
    { value: "hi", label: "Hindi" },
    { value: "ar", label: "Arabic" },
    { value: "pt", label: "Portuguese" },
    { value: "ru", label: "Russian" },
    { value: "ja", label: "Japanese" },
    { value: "ko", label: "Korean" },
    { value: "nl", label: "Dutch" },
    { value: "tr", label: "Turkish" },
    { value: "pl", label: "Polish" },
    { value: "vi", label: "Vietnamese" },
    { value: "th", label: "Thai" },
    { value: "uk", label: "Ukrainian" },
    { value: "el", label: "Greek" },
    { value: "cs", label: "Czech" },
    { value: "sv", label: "Swedish" },
    { value: "da", label: "Danish" },
    { value: "fi", label: "Finnish" },
    { value: "no", label: "Norwegian" },
    { value: "hu", label: "Hungarian" },
    { value: "ro", label: "Romanian" },
    { value: "id", label: "Indonesian" },
    { value: "ms", label: "Malay" },
    { value: "ta", label: "Tamil" },
    { value: "te", label: "Telugu" },
    { value: "ur", label: "Urdu" },
    { value: "fa", label: "Persian" },
    { value: "sw", label: "Swahili" },
    { value: "zu", label: "Zulu" },
    { value: "xh", label: "Xhosa" },
    { value: "af", label: "Afrikaans" },
    { value: "sq", label: "Albanian" },
    { value: "hy", label: "Armenian" },
    { value: "az", label: "Azerbaijani" },
    { value: "eu", label: "Basque" },
    { value: "be", label: "Belarusian" },
    { value: "bg", label: "Bulgarian" },
    { value: "ca", label: "Catalan" },
    { value: "hr", label: "Croatian" },
    { value: "et", label: "Estonian" },
    { value: "tl", label: "Filipino" },
    { value: "gl", label: "Galician" },
    { value: "ka", label: "Georgian" },
    { value: "gu", label: "Gujarati" },
    { value: "ht", label: "Haitian Creole" },
    { value: "ha", label: "Hausa" },
    { value: "iw", label: "Hebrew" },
    { value: "is", label: "Icelandic" },
    { value: "ga", label: "Irish" },
    { value: "jw", label: "Javanese" },
    { value: "kn", label: "Kannada" },
    { value: "kk", label: "Kazakh" },
    { value: "km", label: "Khmer" },
    { value: "lo", label: "Lao" },
    { value: "la", label: "Latin" },
    { value: "lv", label: "Latvian" },
    { value: "lt", label: "Lithuanian" },
    { value: "mk", label: "Macedonian" },
    { value: "mg", label: "Malagasy" },
    { value: "ml", label: "Malayalam" },
    { value: "mt", label: "Maltese" },
    { value: "mi", label: "Maori" },
    { value: "mr", label: "Marathi" },
    { value: "mn", label: "Mongolian" },
    { value: "ne", label: "Nepali" },
    { value: "ps", label: "Pashto" },
    { value: "pa", label: "Punjabi" },
    { value: "sm", label: "Samoan" },
    { value: "gd", label: "Scottish Gaelic" },
    { value: "sr", label: "Serbian" },
    { value: "st", label: "Sesotho" },
    { value: "sn", label: "Shona" },
    { value: "sd", label: "Sindhi" },
    { value: "si", label: "Sinhala" },
    { value: "sk", label: "Slovak" },
    { value: "sl", label: "Slovenian" },
    { value: "so", label: "Somali" },
    { value: "su", label: "Sundanese" },
    { value: "tg", label: "Tajik" },
    { value: "tt", label: "Tatar" },
    { value: "cy", label: "Welsh" },
    { value: "yi", label: "Yiddish" },
    { value: "yo", label: "Yoruba" },
    { value: "zu", label: "Zulu" },
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

  const translateText = async (text, sourceLanguage, targetLanguage) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/learning/translate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            sourceLanguage,
            targetLanguage,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.translatedText;
    } catch (error) {
      console.error("Error translating text:", error);
      return text; // Return original text if translation fails
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
      // Translate the user's message to the selected translation language
      const translatedUserMessage = await translateText(
        inputText,
        selectedLanguage,
        translationLanguage
      );

      // Simulate a bot response (you can replace this with an actual API call)
      const botResponse = `Translated: ${translatedUserMessage}`;

      setMessages((prev) => [
        ...prev,
        {
          text: botResponse,
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
      <h2 className="text-2xl font-bold mb-4">Translate Your Thoughts</h2>

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

      {/* Translation Language Selector */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Translate to:
        </label>
        <select
          className="w-full p-2 border rounded"
          value={translationLanguage}
          onChange={(e) => setTranslationLanguage(e.target.value)}
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* Chat Messages */}
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

      {/* Input Area */}
      <div className="flex space-x-2">
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
