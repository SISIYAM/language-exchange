"use client";
import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ZEGO_CONFIG } from "@/config/zegoConfig";

const CallPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ZegoUIKitRef = useRef(null);
  const zegoRef = useRef(null);

  useEffect(() => {
    const initializeZegoCloud = async () => {
      if (typeof window === "undefined") return;

      try {
        const module = await import("@zegocloud/zego-uikit-prebuilt");
        ZegoUIKitRef.current = module.ZegoUIKitPrebuilt;

        const roomID = searchParams.get("roomID");
        const userID = searchParams.get("userID");
        const userName = searchParams.get("userName");
        const isVideoCall = searchParams.get("isVideoCall") === "true";

        if (!roomID || !userID || !userName) {
          console.error("Missing call parameters");
          router.push("/");
          return;
        }

        const kitToken = ZegoUIKitRef.current.generateKitTokenForTest(
          ZEGO_CONFIG.appID,
          ZEGO_CONFIG.serverSecret,
          roomID,
          userID,
          userName
        );

        const zp = ZegoUIKitRef.current.create(kitToken);
        zegoRef.current = zp;

        await zp.joinRoom({
          container: document.getElementById("zego-call-container"),
          scenario: {
            mode: isVideoCall
              ? ZegoUIKitRef.current.VideoConference
              : ZegoUIKitRef.current.OneONoneCall,
          },
          showPreJoinView: true,
          turnOnCameraWhenJoining: isVideoCall,
        });
      } catch (error) {
        console.error("Error initializing call:", error);
        router.push("/");
      }
    };

    initializeZegoCloud();

    return () => {
      if (zegoRef.current) {
        zegoRef.current.destroy(); // 🔹 Use destroy() instead of leaveRoom()
      }
    };
  }, [searchParams, router]);

  return (
    <div className="h-screen flex justify-center items-center bg-black">
      <div id="zego-call-container" className="w-full h-full"></div>
    </div>
  );
};

export default CallPage;
