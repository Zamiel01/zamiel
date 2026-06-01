"use client";

import { useTheme } from "./ThemeProvider";
import { FaGear, FaMoon, FaSun } from "react-icons/fa6";

export default function FloatingControls() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="floating-controls fixed right-[30px] top-[30px] flex flex-col gap-[15px] z-[200]">
      <div className="control-icon rounded-full flex items-center justify-center cursor-pointer">
        <FaGear />
      </div>
      <div
        className="control-icon rounded-full flex items-center justify-center cursor-pointer"
        onClick={toggleTheme}
      >
        {theme === "light" ? <FaSun /> : <FaMoon />}
      </div>
    </div>
  );
}
