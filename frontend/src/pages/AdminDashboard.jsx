import { useEffect, useState } from "react";
import client from "../api/client";
import ComplaintCard from "../components/ComplaintCard.jsx";

const STATUSES = ["", "OPEN", "IN_PROGRESS", "RESOLVED"];

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");

  function load() {
    setLoading(true);
    const params = {};
    if (status) params.status = status;
    if (category) params.category = category;
    Promise.all([client.get("/complaints", { params }), client.get("/dashboard")])
      .then(([cRes, dRes]) => {
        setComplaints(cRes.data.complaints);
        setStats(dRes.data);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [status, category]);

  const categories = Array.from(new Set(complaints.map((c) => c.category)));

  return (
    <div>
      <h1>Admin Dashboard</h1>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{stats.totalComplaints}</span>
            <span className="stat-label">Total Complaints</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.byStatus.OPEN}</span>
            <span className="stat-label">Open</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.byStatus.IN_PROGRESS}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.byStatus.RESOLVED}</span>
            <span className="stat-label">Resolved</span>
          </div>
          <div className="stat-card stat-card-warning">
            <span className="stat-value">{stats.overdueCount}</span>
            <span className="stat-label">Overdue</span>
          </div>
        </div>
      )}

      {stats && Object.keys(stats.byCategory).length > 0 && (
        <div className="card">
          <h3>By Category</h3>
          <ul className="category-breakdown">
            {Object.entries(stats.byCategory).map(([cat, count]) => (
              <li key={cat}>
                <span>{cat}</span>
                <span>{count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="filters">
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s ? s.replace("_", " ") : "All"}
              </option>
            ))}
          </select>
        </label>
        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <p className="muted">Loading...</p>
      ) : complaints.length === 0 ? (
        <p className="muted">No complaints match these filters.</p>
      ) : (
        <div className="card-grid">
          {complaints.map((c) => (
            <ComplaintCard key={c.id} complaint={c} showResident />
          ))}
        </div>
      )}
    </div>
  );
}
