import type { Metadata } from "next";
import BlogExperience from "./BlogExperience";

export const metadata: Metadata = {
  title: "Blog — Nkuin Eugene",
  description:
    "Notes on software, building in public, and the ideas that shape my work.",
};

export default function BlogPage() {
  return <BlogExperience />;
}
