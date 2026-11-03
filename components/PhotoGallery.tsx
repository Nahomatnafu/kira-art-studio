"use client";
import Link from "next/link";
import ArtworkImage from "./ArtworkImage";
import {useImageSettings} from "./ImageSettingsProvider";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function PhotoGallery({
  photos,
  title = "Community Gallery",
  initialCount = 6,
  moreLink,
  groupKey="gallery",
}: {
  photos: string[];
  groupKey?:string;
  title?: string;
  initialCount?: number;
  moreLink?: string;
}) {
  const images=useImageSettings();
  const uniquePhotos = [...new Set(photos)].filter(Boolean);
  const [visible, setVisible] = useState(initialCount);
  const [current, setCurrent] = useState<number | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const focusBeforeOpen = useRef<HTMLElement | null>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const open = current !== null;
  useEffect(() => {
    if (!open) return;
    focusBeforeOpen.current = document.activeElement as HTMLElement;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const keys = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCurrent(null);
      if (e.key === "ArrowRight")
        setCurrent((v) => (v === null ? null : (v + 1) % uniquePhotos.length));
      if (e.key === "ArrowLeft")
        setCurrent((v) =>
          v === null
            ? null
            : (v - 1 + uniquePhotos.length) % uniquePhotos.length,
        );
      if (e.key === "Tab") {
        const items =
          dialog.current?.querySelectorAll<HTMLButtonElement>("button");
        if (!items?.length) return;
        const first = items[0],
          last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", keys);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", keys);
      focusBeforeOpen.current?.focus();
    };
  }, [open, uniquePhotos.length]);
  if (!uniquePhotos.length) return null;
  return (
    <section
      id={!moreLink ? "photo-gallery" : undefined}
      className="photo-gallery-section"
    >
      <div className="section-top">
        <h2>{title}</h2>
        {moreLink && (
          <Link className="text-link" href={moreLink}>
            View Photo Gallery
          </Link>
        )}
      </div>
      <div className="community-photo-grid">
        {uniquePhotos.slice(0, visible).map((src, i) => (
          <button
            className="community-photo-tile"
            key={src}
            onClick={() => setCurrent(i)}
            aria-label={`Open ${title.toLowerCase()} photo ${i + 1}`}
          >
            <ArtworkImage src={src} imageKey={groupKey+".photo."+i} alt="People and artwork at a Kira Art Studio gathering" fit="cover" />
          </button>
        ))}
      </div>
      {visible < uniquePhotos.length && (
        <button
          className="button button-outline gallery-more"
          onClick={() => setVisible((v) => v + 6)}
        >
          Show More Photos
        </button>
      )}
      {current !== null && (
        <div className="photo-lightbox" onClick={() => setCurrent(null)}>
          <div
            ref={dialog}
            className="photo-lightbox-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="photo-lightbox-top">
              <span>{title}</span>
              <button
                ref={closeButton}
                className="icon-button"
                aria-label="Close photo"
                onClick={() => setCurrent(null)}
              >
                <X />
              </button>
            </div>
            <div className="photo-lightbox-image">
              <img
                src={images[groupKey+".photo."+current]?.src || uniquePhotos[current]}
                alt="People and artwork at a Kira Art Studio gathering"
              />
            </div>
            <div className="photo-lightbox-bottom">
              <button
                className="icon-button"
                aria-label="Previous photo"
                onClick={() =>
                  setCurrent((v) =>
                    v === null
                      ? null
                      : (v - 1 + uniquePhotos.length) % uniquePhotos.length,
                  )
                }
              >
                <ChevronLeft />
              </button>
              <span aria-live="polite">
                Photo {current + 1} of {uniquePhotos.length}
              </span>
              <button
                className="icon-button"
                aria-label="Next photo"
                onClick={() =>
                  setCurrent((v) =>
                    v === null ? null : (v + 1) % uniquePhotos.length,
                  )
                }
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
