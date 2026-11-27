import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="page-wrap center-page">
      <div className="page-heading">
        <h1>Page not found</h1>
        <p>This page does not exist. Go back to the home page to start again.</p>
      </div>
      <Link to="/" className="primary-button" style={{ display: "inline-flex", marginBottom: 80 }}>Back to home</Link>
    </section>
  );
}
