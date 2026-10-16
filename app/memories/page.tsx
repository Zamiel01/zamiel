import type { Metadata } from "next";
import MemoriesGallery from "./MemoriesGallery";

export const metadata: Metadata = {
  title: "Memories — Nkuin Eugene",
  description:
    "Personal memories, hackathons, friends, events, and everyday life.",
};

export default function MemoriesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col px-6 lg:px-24 py-16">
      
      {/* Innovative Editorial Header */}
      <div className="w-full max-w-7xl mx-auto mb-16 border-b border-[#222222] pb-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#888888]">
                A PERSONAL ARCHIVE
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight">
              Moments. <br />
              <span className="font-light italic text-[#aaaaaa]">My picks.</span>
            </h1>
          </div>

          {/* Minimalist Archive Note Box */}
          <div className="bg-[#121212] border border-[#222222] p-6 rounded-2xl max-w-xs shadow-xl">
            <span className="block text-[10px] font-mono uppercase tracking-widest text-[#777777] mb-2">
              01 / ALWAYS IN PROGRESS
            </span>
            <p className="text-sm text-[#cccccc] leading-relaxed">
              Little pieces of life, kept close. Hackathons, friends, and everyday milestones.
            </p>
          </div>
        </div>
      </div>

      {/* Gallery Wrapper */}
      <div className="w-full max-w-7xl mx-auto flex-1">
        <MemoriesGallery />
      </div>

    </div>
  );
}