"use client";
import { useState } from "react";
import { Search, X } from "lucide-react";
import type { Content } from "@/lib/content";
import ArtworkCard from "./ArtworkCard";
export default function Gallery({
  content,
  category = "",
  query = "",
}: {
  content: Pick<Content, "artworks" | "collections">;
  category?: string;
  query?: string;
}) {
  const [selected, setSelected] = useState(category);
  const [search, setSearch] = useState(query);
  const [availability, setAvailability] = useState("all");
  const collection = content.collections.find((c) => c.id === selected);
  const works = content.artworks.filter(
    (a) =>
      a.published &&
      (!selected || a.category === selected) &&
      (availability === "all" || a.status === availability) &&
      (a.title + " " + a.story + " " + a.materials)
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <div className="gallery-toolbar">
        <div className="filter-tabs" aria-label="Filter by collection">
          <button
            className={!selected ? "selected" : ""}
            onClick={() => setSelected("")}
          >
            All works
          </button>
          {content.collections.map((c) => (
            <button
              key={c.id}
              className={selected === c.id ? "selected" : ""}
              onClick={() => setSelected(c.id)}
            >
              {c.title}
              {c.comingSoon && <span className="tiny-dot" />}
            </button>
          ))}
        </div>
        <div className="gallery-controls">
          <div className="search-field">
            <Search size={16} />
            <input
              aria-label="Search the gallery"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search works"
            />
            {search && (
              <button aria-label="Clear search" onClick={() => setSearch("")}>
                <X size={14} />
              </button>
            )}
          </div>
          <select
            aria-label="Filter by availability"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          >
            <option value="all">All availability</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
          </select>
        </div>
      </div>
      <div className="gallery-count">
        <span>{collection?.title || "The collection"}</span>
        <span>
          {works.length} {works.length === 1 ? "work" : "works"}
        </span>
      </div>
      {works.length ? (
        <div className="artwork-grid gallery-grid">
          {works.map((a) => (
            <ArtworkCard key={a.id} artwork={a} />
          ))}
        </div>
      ) : (
        <div className="empty-gallery">
          <span className="eyebrow">
            {collection?.comingSoon ? "A NEW CHAPTER" : "THE GALLERY"}
          </span>
          <h2>
            {collection?.comingSoon
              ? "Something beautiful is taking shape."
              : "No works found."}
          </h2>
          <p>
            {collection?.comingSoon
              ? collection.description + " This collection is coming soon."
              : "Try a different search or availability filter."}
          </p>
          <button
            className="button button-outline"
            onClick={() => {
              setSelected("");
              setSearch("");
              setAvailability("all");
            }}
          >
            Explore all works ↗
          </button>
        </div>
      )}
    </>
  );
}
