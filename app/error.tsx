"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="section empty-gallery">
      <h1>A brief pause at the studio.</h1>
      <p>We couldn’t load this page. Please try again in a moment.</p>
      <button className="button button-dark" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
