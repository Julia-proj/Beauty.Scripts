import { useEffect, useRef } from "react";

type Props = { url: string; maxWidth?: number };

export default function InstaEmbed({ url, maxWidth = 320 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // грузим скрипт инсты один раз
    const id = "ig-embed-script";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id;
      s.src = "https://www.instagram.com/embed.js";
      s.async = true;
      s.onload = () => (window as any).instgrm?.Embeds?.process();
      document.body.appendChild(s);
    } else {
      (window as any).instgrm?.Embeds?.process();
    }
  }, []);

  return (
    <div className="ig-wrap" style={{ maxWidth }}>
      <blockquote
        ref={ref}
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={{ background: "#fff", border: 0, margin: 0, padding: 0, width: "100%" }}
      />
      <style jsx>{`
        .ig-wrap {
          width: 100%;
          aspect-ratio: 9 / 16; /* рилс */
          overflow: hidden;
          border-radius: 16px;
        }
        :global(.instagram-media) {
          width: 100% !important;
          min-width: 0 !important;
        }
      `}</style>
    </div>
  );
}
