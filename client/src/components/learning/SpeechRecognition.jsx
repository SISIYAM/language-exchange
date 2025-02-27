"use client";
import React, { useState, useRef } from "react";
import { FaMicrophone, FaStop, FaPlay } from "react-icons/fa";

const SpeechRecognition = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [text, setText] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

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

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioUrl);
        checkPronunciation(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setFeedback("Error accessing microphone. Please check your permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const checkPronunciation = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob);
      formData.append("text", text);

      const response = await fetch("/api/learning/check-pronunciation", {
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
      setFeedback(data.feedback);
    } catch (error) {
      console.error("Error checking pronunciation:", error);
      setFeedback("Error analyzing pronunciation. Please try again.");
    }
  };

  const playRecording = () => {
    if (recordedAudio) {
      const audio = new Audio(recordedAudio);
      audio.play();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Pronunciation Practice</h2>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Text to Practice:
        </label>
        <textarea
          className="w-full p-2 border rounded"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to practice pronunciation..."
          rows="3"
        />
      </div>

      <div className="flex space-x-4 mb-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`flex items-center px-4 py-2 rounded ${
            isRecording
              ? "bg-red-500 hover:bg-red-600"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white`}
        >
          {isRecording ? (
            <>
              <FaStop className="mr-2" /> Stop Recording
            </>
          ) : (
            <>
              <FaMicrophone className="mr-2" /> Start Recording
            </>
          )}
        </button>

        {recordedAudio && (
          <button
            onClick={playRecording}
            className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
          >
            <FaPlay className="mr-2" /> Play Recording
          </button>
        )}
      </div>

      {feedback && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Feedback:</h3>
          <p>{feedback}</p>
        </div>
      )}
    </div>
  );
};

export default SpeechRecognition;
