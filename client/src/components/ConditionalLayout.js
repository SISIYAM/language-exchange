"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/shared/Navbar";
import Footer from "@/shared/Footer";

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const isCallRoute = pathname.startsWith("/call");

  return (
    <>
      {!isCallRoute && <Navbar />}
      <div className="min-h-screen mx-auto">{children}</div>
      {!isCallRoute && <Footer />}
    </>
  );
}
