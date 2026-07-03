import { Link } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  return (
    <>
      <nav className="navbar">
        <div className="logo">🏢 Society Maintenance Tracker</div>

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
          <h1>
            Smart Society <br />
            Maintenance Tracker
          </h1>

          <p>
            Raise maintenance complaints, upload images, track complaint
            progress, receive email notifications, and manage your apartment
            society with ease.
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
          <img
            src="https://images.unsplash.com/photo-1460317442991-0ec209397118?w=700"
            alt="Apartment"
          />
        </div>
      </header>

      <section id="features" className="features">
        <h2>Key Features</h2>

        <div className="card-grid">
          <div className="card">
            <h3>📋 Complaint Management</h3>
            <p>Submit maintenance requests in seconds.</p>
          </div>

          <div className="card">
            <h3>📷 Image Upload</h3>
            <p>Attach photos to explain maintenance issues.</p>
          </div>

          <div className="card">
            <h3>📊 Live Status</h3>
            <p>Track complaints from Pending to Resolved.</p>
          </div>

          <div className="card">
            <h3>👨‍💼 Admin Dashboard</h3>
            <p>Manage complaints, priorities and notices.</p>
          </div>

          <div className="card">
            <h3>📢 Notice Board</h3>
            <p>View important announcements instantly.</p>
          </div>

          <div className="card">
            <h3>📧 Email Notifications</h3>
            <p>Automatic updates whenever status changes.</p>
          </div>
        </div>
      </section>

      <section id="how" className="workflow">
        <h2>How It Works</h2>

        <div className="steps">
          <div>1️⃣ Register</div>
          <div>2️⃣ Raise Complaint</div>
          <div>3️⃣ Admin Reviews</div>
          <div>4️⃣ Issue Resolved</div>
        </div>
      </section>

      <section className="stats">
        <div>
          <h2>500+</h2>
          <p>Complaints Resolved</p>
        </div>

        <div>
          <h2>1000+</h2>
          <p>Residents</p>
        </div>

        <div>
          <h2>24×7</h2>
          <p>Support</p>
        </div>

        <div>
          <h2>99%</h2>
          <p>User Satisfaction</p>
        </div>
      </section>

      <footer id="contact">
        <h3>Society Maintenance Tracker</h3>

        <p>
          Making apartment maintenance transparent, efficient and hassle-free.
        </p>

        <p>© 2026 Society Maintenance Tracker. All Rights Reserved.</p>
      </footer>
    </>
  );
}