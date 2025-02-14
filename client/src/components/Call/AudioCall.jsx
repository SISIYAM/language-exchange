"use client";
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

// Initialize Socket.IO client connection
const socket = io("http://localhost:8080", {
  path: "/api/socket.io",
  autoConnect: true,
}); //

const AudioCall = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callStartTime, setCallStartTime] = useState(null);
  const [callDuration, setCallDuration] = useState("00:00");
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const peerConnection = useRef(null);
  const durationInterval = useRef(null);

  useEffect(() => {
    // Get user's audio stream
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        setLocalStream(stream);
        if (localAudioRef.current) {
          localAudioRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error("Error accessing media devices.", err));
  }, []);

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${
      remainingSeconds < 10 ? "0" : ""
    }${remainingSeconds}`;
  };

  const startDurationTimer = () => {
    setCallStartTime(Date.now());
    durationInterval.current = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - callStartTime) / 1000);
      setCallDuration(formatDuration(elapsedSeconds));
    }, 1000);
  };

  const stopDurationTimer = () => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", event.candidate);
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
      }
      startDurationTimer(); // Start the timer when a remote stream is detected
    };

    if (localStream) {
      localStream
        .getTracks()
        .forEach((track) => pc.addTrack(track, localStream));
    }

    return pc;
  };

  useEffect(() => {
    // Handle offer from remote peer
    socket.on("offer", async (offer) => {
      peerConnection.current = createPeerConnection();
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(
        new RTCSessionDescription(answer)
      );
      socket.emit("answer", answer);
    });

    // Handle answer from remote peer
    socket.on("answer", (answer) => {
      peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    // Handle ICE candidates
    socket.on("ice-candidate", (candidate) => {
      const iceCandidate = new RTCIceCandidate(candidate);
      peerConnection.current.addIceCandidate(iceCandidate);
    });

    return () => {
      stopDurationTimer(); // Stop timer when the component unmounts or the call ends
    };
  }, [callStartTime]);

  const callUser = async () => {
    peerConnection.current = createPeerConnection();
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(
      new RTCSessionDescription(offer)
    );
    socket.emit("offer", offer);
    startDurationTimer(); // Start the timer when the call is initiated
  };

  return (
    <div>
      <h2>Audio Call</h2>
      <div>
        <audio ref={localAudioRef} autoPlay muted></audio>
        <audio ref={remoteAudioRef} autoPlay></audio>
      </div>
      <div>Call Duration: {callDuration}</div>
      <button onClick={callUser}>Call</button>
    </div>
  );
};

export default AudioCall;
