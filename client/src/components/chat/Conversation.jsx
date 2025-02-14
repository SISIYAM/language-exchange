import React, { useEffect, useRef, useState } from "react";
import {
  FaPhone,
  FaVideo,
  FaMicrophone,
  FaMicrophoneSlash,
  FaPhoneSlash,
  FaCamera,
  FaCameraSlash,
} from "react-icons/fa";
import io from "socket.io-client";
import MessageInput from "./MessageInput";
import { useDispatch, useSelector } from "react-redux";
import { fetchConversationHistory } from "@/features/user/chatSlice";
import Image from "next/image";

const socket = io("http://localhost:8080"); // Adjust to your server URL

const Conversation = () => {
  const dispatch = useDispatch();
  const { conversation, selectedUser } = useSelector((state) => state.chat);
  const { currentUser } = useSelector((state) => state.user);
  const [messages, setMessages] = useState([]);
  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true); // State to manage camera
  const [countdown, setCountdown] = useState(0); // Countdown state
  const [showCountdown, setShowCountdown] = useState(false); // State to manage countdown display
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (currentUser?.id && selectedUser?.id) {
      dispatch(
        fetchConversationHistory({
          userId1: currentUser.id,
          userId2: selectedUser.id,
        })
      );

      const room = [currentUser.id, selectedUser.id].sort().join("-");
      socket.emit("joinRoom", room, () => console.log(`Joined room: ${room}`));

      socket.on("receiveMessage", handleIncomingMessage);
      socket.on("callUser", handleIncomingCall);
      socket.on("callAccepted", handleCallAccepted);
      socket.on("iceCandidate", handleIceCandidate);

      return () => {
        socket.off("receiveMessage", handleIncomingMessage);
        socket.off("callUser");
        socket.off("callAccepted");
        socket.off("iceCandidate");
      };
    }
  }, [currentUser?.id, selectedUser?.id, dispatch]);

  useEffect(() => {
    if (conversation?.length) {
      setMessages(conversation);
      scrollToBottom();
    }
  }, [conversation]);

  const handleIncomingMessage = (newMessage) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    scrollToBottom();
  };

  const handleIncomingCall = async (data) => {
    setIsCalling(true);
    setCountdown(2); // Set countdown to 2 seconds
    setShowCountdown(false); // Initially show "Calling..."

    // Start the countdown after 2 seconds
    setTimeout(() => {
      setShowCountdown(true); // Show countdown after 2 seconds
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      // Clear the countdown interval after 10 seconds or when call ends
      const callDuration = 10; // Define the duration of the call
      setTimeout(() => {
        clearInterval(countdownInterval);
        setIsCalling(false);
        setCountdown(0); // Reset countdown when call ends
      }, callDuration * 1000); // Call duration in milliseconds
    }, 2000); // Wait for 2 seconds

    await answerCall(data.signal);
  };

  const handleCallAccepted = async (signal) => {
    await answerCall(signal);
  };

  const handleIceCandidate = (data) => {
    peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
  };

  const startVideoCall = async () => {
    try {
      setIsVideoCall(true);
      setIsCalling(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { facingMode: "user" }, // Default to front camera
      });
      localStreamRef.current = stream;

      peerRef.current = new RTCPeerConnection();

      stream.getTracks().forEach((track) => {
        peerRef.current.addTrack(track, stream);
      });

      peerRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("iceCandidate", { candidate: event.candidate });
        }
      };

      const offer = await peerRef.current.createOffer();
      await peerRef.current.setLocalDescription(offer);
      socket.emit("callUser", { signal: offer, receiver: selectedUser.id });
    } catch (error) {
      console.error("Error starting video call:", error);
    }
  };

  const answerCall = async (signal) => {
    peerRef.current = new RTCPeerConnection();

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peerRef.current.addTrack(track, localStreamRef.current);
      });
    }

    await peerRef.current.setRemoteDescription(
      new RTCSessionDescription(signal)
    );

    peerRef.current.ontrack = (event) => {
      const remoteStream = event.streams[0];
      remoteStreamRef.current = remoteStream;
      // Set video element source to remote stream
      const remoteVideoElement = document.getElementById("remote-video");
      if (remoteVideoElement) {
        remoteVideoElement.srcObject = remoteStream;
      }
    };

    peerRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("iceCandidate", { candidate: event.candidate });
      }
    };

    setIsCalling(true);
  };

  const endCall = () => {
    setIsCalling(false);
    setIsVideoCall(false);
    setIsCameraOn(true); // Reset camera state
    if (peerRef.current) {
      peerRef.current.close();
    }
    // if (localStreamRef.current) {
    //   localStreamRef.current.getTracks().forEach((track) => track.stop());
    // }
    localStreamRef.current = null;
    remoteStreamRef.current = null;
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      // localStreamRef.current.getTracks().forEach((track) => {
      //   track.enabled = !track.enabled; // Toggle audio track
      // });
      setIsMuted((prev) => !prev);
    }
  };

  const toggleCamera = () => {
    // if (localStreamRef.current) {
    //   // const videoTrack = localStreamRef.current.getVideoTracks()[0];
    //   // videoTrack.enabled = !videoTrack.enabled; // Toggle video track
    // }
    setIsCameraOn(false);
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      setTimeout(() => {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }, 100);
    }
  };

  return (
    <div className="relative flex-1 h-[80vh] bg-white shadow-sm">
      {/* Chat Header */}
      {selectedUser && !isCalling && (
        <div className="sticky top-0 z-10 bg-white px-6 py-4 border-b shadow-sm flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={`https://tandem.net/_next/image?url=https%3A%2F%2Fimages.ctfassets.net%2F0uov5tlk8deu%2F7mTO4XUWrP5O2BuCKOE8gC%2F475d756d589257be1d8495500447fcb6%2Fanne.jpg&w=767&q=100`}
              alt="Profile"
              className="w-10 h-10 rounded-full mr-4 cursor-pointer"
            />
            <div>
              <p className="font-semibold text-gray-700 text-lg">
                {"Sevli" || "Unknown"}
              </p>
              <p className="text-sm text-green-500">
                {selectedUser?.isActive ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={startVideoCall}
              className="p-2 rounded-full hover:bg-gray-200"
            >
              <FaVideo />
            </button>
            <button
              onClick={startVideoCall}
              className="p-2 rounded-full hover:bg-gray-200"
            >
              <FaPhone />
            </button>
          </div>
        </div>
      )}

      {/* Call Screen */}
      {isCalling && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-400 bg-opacity-80">
          <h2 className="text-white text-2xl">In Call with Sevli</h2>
          {!showCountdown ? (
            <p className="text-white text-lg animate-pulse">Calling...</p>
          ) : (
            <p className="text-white text-lg">
              {countdown > 0 ? `${countdown} seconds` : "In Call"}
            </p>
          )}
          <div className="mt-4 flex space-x-4">
            <button
              onClick={toggleMute}
              className="p-3 text-white rounded-full bg-blue-500 hover:bg-blue-600"
            >
              {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
            </button>
            <button
              onClick={endCall}
              className="p-3 text-white rounded-full bg-red-500 hover:bg-red-600"
            >
              <FaPhoneSlash />
            </button>
            {isVideoCall && (
              <button
                onClick={toggleCamera}
                className="p-3 text-white rounded-full bg-yellow-500 hover:bg-yellow-600"
              >
                {isCameraOn ? <FaCamera /> : <FaCameraSlash />}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Video Elements */}
      {isVideoCall && (
        <div className="flex items-center justify-center">
          <video
            id="local-video"
            ref={localStreamRef}
            autoPlay
            muted
            className="w-1/2 border-2 border-white"
          />
          <video
            id="remote-video"
            ref={remoteStreamRef}
            autoPlay
            className="w-1/2 border-2 border-white"
          />
        </div>
      )}

      {/* Chat Messages */}
      <div
        className={`${
          selectedUser && !isCalling ? "h-[calc(80vh-10rem)]" : "h-full"
        } bg-gradient-to-b from-indigo-50 via-white to-gray-50 overflow-y-auto p-6 space-y-4`}
        ref={chatContainerRef}
      >
        {selectedUser && !isCalling ? (
          messages.length ? (
            messages.map((item, index) => (
              <div
                key={item.id || index}
                className={`flex items-start gap-3 ${
                  item?.senderId === currentUser?.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {item?.senderId !== currentUser?.id && (
                  <img
                    src={`https://tandem.net/_next/image?url=https%3A%2F%2Fimages.ctfassets.net%2F0uov5tlk8deu%2F7mTO4XUWrP5O2BuCKOE8gC%2F475d756d589257be1d8495500447fcb6%2Fanne.jpg&w=767&q=100`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div
                  className={`p-3 rounded-lg ${
                    item?.senderId === currentUser?.id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {item?.message}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400">No messages yet.</p>
          )
        ) : (
          <div className="flex items-center h-full justify-center">
            <div className="flex  flex-col  items-center space-x-1">
              <Image
                src="https://res.cloudinary.com/dh20zdtys/image/upload/v1723709261/49f87c8af2a00c070b11e2b15349fa1c_uakips.png"
                width={150}
                height={150}
                alt="Logo"
              />
            </div>
          </div>
        )}
      </div>
      {/* Sidebar for Profile Details */}

      {/* Message Input */}
      {!isCalling && <MessageInput selectedUser={selectedUser} />}
    </div>
  );
};

export default Conversation;
