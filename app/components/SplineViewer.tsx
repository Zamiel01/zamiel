"use client";

import { useEffect, useRef } from "react";

interface SplineViewerProps {
  url: string;
  loading?: string;
  style?: React.CSSProperties;
}

export default function SplineViewer({ url, loading, style }: SplineViewerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const viewer = document.createElement("spline-viewer");
    (viewer as any).url = url;
    if (loading) (viewer as any).loading = loading;
    Object.assign(viewer.style, style || {});

    el.appendChild(viewer);

    return () => {
      el.removeChild(viewer);
    };
  }, [url, loading]);

  return <div ref={ref} style={{ width: "100%", height: "100%" }} />;
}
