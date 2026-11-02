import Link from "next/link";
export default function NotFound() {
  return (
    <section className="section empty-gallery">
      <span className="eyebrow">A LITTLE OFF THE CANVAS</span>
      <h1>This page isn’t here.</h1>
      <p>Let’s find your way back to the artwork.</p>
      <Link className="button button-dark" href="/artwork">
        Explore the gallery ↗
      </Link>
    </section>
  );
}
