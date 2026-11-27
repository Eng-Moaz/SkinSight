import { useEffect, useState } from "react";
import { NavLink, Link, Outlet, useLocation } from "react-router-dom";
import { Activity, ArrowUpRight, Info, Menu, X } from "lucide-react";

export default function Layout() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);

  // Close the mobile menu on every page change.
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setOpen(false);
  }

  // Scroll to top and move focus to the main area on every page change.
  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById("main")?.focus({ preventScroll: true });
  }, [pathname]);

  const navClass = ({ isActive }) => (isActive ? "nav-link active" : "nav-link");

  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">Skip to content</a>
      <div className="topline">
        <span className="topline-dot" /> STUDENT RESEARCH PROJECT{" "}
        <span className="topline-divider">/</span> NOT A MEDICAL DIAGNOSIS
      </div>

      <header className="header">
        <Link to="/" className="brand" aria-label="SkinSight home">
          <span className="brand-mark"><Activity size={21} strokeWidth={2.5} /></span>
          <span>skin<span className="brand-accent">sight</span><small>SEE WITH CLARITY</small></span>
        </Link>
        <button
          type="button"
          className="mobile-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav className={open ? "nav nav-open" : "nav"} aria-label="Main">
          <NavLink to="/" end className={navClass}>Home</NavLink>
          <NavLink to="/upload" className={navClass}>Check a spot</NavLink>
          <NavLink to="/about" className={navClass}>About the project</NavLink>
          <Link to="/upload" className="nav-cta">Get started <ArrowUpRight size={16} /></Link>
        </nav>
      </header>

      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-main">
          <div className="brand footer-brand">
            <span className="brand-mark"><Activity size={20} /></span>
            <span>skin<span className="brand-accent">sight</span><small>SEE WITH CLARITY</small></span>
          </div>
          <p>Making AI research easier to understand.</p>
          <Link to="/about" className="quiet-button">About this project <ArrowUpRight size={15} /></Link>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 SkinSight Student Project</span>
          <span>Photos are used only to make a prediction and are not stored.</span>
        </div>
      </footer>

      <div className="disclaimer" role="note">
        <Info size={15} />
        <span>
          <strong>Important:</strong> SkinSight is a student project for educational purposes only.
          It is not a medical device and does not provide a medical diagnosis. Always consult a
          qualified healthcare professional about skin concerns.
        </span>
      </div>
    </div>
  );
}
