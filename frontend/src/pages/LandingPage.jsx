import { Link } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  return (
    <>
      <nav className="navbar">
        <div className="logo">
          <span className="logo-mark">⌂</span>
          Society Maintenance Tracker
        </div>

        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how">How It Works</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>

        <div className="nav-buttons">
          <Link to="/login" className="btn-outline">
            Login
          </Link>

          <Link to="/register" className="btn-primary">
            Register
          </Link>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-left">
          <p className="eyebrow">Every flat, one ledger</p>

          <h1>
            Maintenance, <br />
            <em>accounted for.</em>
          </h1>

          <p className="hero-copy">
            Raise a complaint, attach photos, and watch it move from filed to
            resolved — with every update logged and emailed, the way a good
            society office keeps its books.
          </p>

          <div className="hero-buttons">
            <Link to="/register" className="btn-primary">
              Get Started
            </Link>

            <Link to="/login" className="btn-outline">
              Resident Login
            </Link>
          </div>
        </div>

        <div className="hero-right">
          <div className="token-card" aria-hidden="true">
            <div className="token-notch token-notch-left" />
            <div className="token-notch token-notch-right" />

            <div className="token-row">
              <span className="token-label">Complaint token</span>
              <span className="token-stamp">Filed</span>
            </div>

            <div className="token-id">SMT — 0417</div>

            <div className="token-divider" />

            <div className="token-line">
              <span>Flat</span>
              <span>B-204</span>
            </div>
            <div className="token-line">
              <span>Category</span>
              <span>Plumbing</span>
            </div>
            <div className="token-line">
              <span>Logged</span>
              <span>04 Jul</span>
            </div>

            <div className="token-status-track">
              <div className="token-status-fill" />
            </div>
            <div className="token-status-labels">
              <span className="active">Filed</span>
              <span className="active">Reviewed</span>
              <span>Resolved</span>
            </div>
          </div>
        </div>
      </header>

      <section id="features" className="features">
        <p className="section-eyebrow">What's in the ledger</p>
        <h2>Six entries, one system</h2>

        <div className="card-grid">
          <div className="card">
            <span className="card-index">01</span>
            <h3>Complaint filing</h3>
            <p>Submit a maintenance request in under a minute, from any device.</p>
          </div>

          <div className="card">
            <span className="card-index">02</span>
            <h3>Photo evidence</h3>
            <p>Attach images so the issue is clear before anyone shows up.</p>
          </div>

          <div className="card">
            <span className="card-index">03</span>
            <h3>Live status</h3>
            <p>Every complaint moves visibly from Pending to Resolved.</p>
          </div>

          <div className="card">
            <span className="card-index">04</span>
            <h3>Admin dashboard</h3>
            <p>The office sees priorities, assigns work, and closes tickets.</p>
          </div>

          <div className="card">
            <span className="card-index">05</span>
            <h3>Notice board</h3>
            <p>Society announcements land in one place residents actually check.</p>
          </div>

          <div className="card">
            <span className="card-index">06</span>
            <h3>Email notifications</h3>
            <p>Status changes reach your inbox — no need to keep checking.</p>
          </div>
        </div>
      </section>

      <section id="how" className="workflow">
        <p className="section-eyebrow">The process</p>
        <h2>How a complaint gets closed</h2>

        <div className="steps">
          <div className="step">
            <span className="step-num">01</span>
            <span className="step-label">Register</span>
            <p>Create a resident account for your flat.</p>
          </div>
          <div className="step-connector" />
          <div className="step">
            <span className="step-num">02</span>
            <span className="step-label">Raise complaint</span>
            <p>File the issue with details and photos.</p>
          </div>
          <div className="step-connector" />
          <div className="step">
            <span className="step-num">03</span>
            <span className="step-label">Admin reviews</span>
            <p>The society office triages and assigns it.</p>
          </div>
          <div className="step-connector" />
          <div className="step">
            <span className="step-num">04</span>
            <span className="step-label">Resolved</span>
            <p>You're notified the moment it's closed.</p>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="stat">
          <h2>500+</h2>
          <p>Complaints resolved</p>
        </div>

        <div className="stat">
          <h2>1000+</h2>
          <p>Residents onboard</p>
        </div>

        <div className="stat">
          <h2>24×7</h2>
          <p>Support coverage</p>
        </div>

        <div className="stat">
          <h2>99%</h2>
          <p>User satisfaction</p>
        </div>
      </section>

      <footer id="contact">
        <div className="footer-seal">⌂</div>
        <h3>Society Maintenance Tracker</h3>

        <p>
          Making apartment maintenance transparent, efficient and hassle-free.
        </p>

        <p className="footer-fine">© 2026 Society Maintenance Tracker. All rights reserved.</p>
      </footer>
    </>
  );
}