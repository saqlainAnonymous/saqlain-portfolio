"use client";

import { ReactNode } from "react";
import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";
import CustomCursor from "@/components/CustomCursor";
import Navbar from "@/components/Navbar";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SmoothScroll>
      <Preloader />
      <CustomCursor />
      <div className="grain" aria-hidden />
      <Navbar />
      {children}
    </SmoothScroll>
  );
}
