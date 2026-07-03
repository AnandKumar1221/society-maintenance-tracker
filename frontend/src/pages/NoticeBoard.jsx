import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";

export default function NoticeBoard() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [important, setImportant] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function load() {
    client.get("/notices").then((res) => setNotices(res.data.notices));
  }

  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await client.post("/notices", { title, body, important });
      setTitle("");
      setBody("");
      setImportant(false);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Could not post notice");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Notice Board</h1>
        {user.role === "ADMIN" && (
          <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "+ Post Notice"}
          </button>
        )}
      </div>

      {showForm && (
        <form className="card form" onSubmit={handleSubmit}>
          <label>
            Title
            <input required value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label>
            Body
            <textarea required rows={3} value={body} onChange={(e) => setBody(e.target.value)} />
          </label>
          <label className="checkbox-label">
            <input type="checkbox" checked={important} onChange={(e) => setImportant(e.target.checked)} />
            Mark as important (pins to top &amp; emails all residents)
          </label>
          {error && <div className="error">{error}</div>}
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Posting..." : "Post Notice"}
          </button>
        </form>
      )}

      {notices.length === 0 ? (
        <p className="muted">No notices yet.</p>
      ) : (
        <div className="notice-list">
          {notices.map((n) => (
            <div key={n.id} className={`card notice-card ${n.important ? "notice-pinned" : ""}`}>
              {n.important && <span className="badge badge-overdue">📌 Important</span>}
              <h3>{n.title}</h3>
              <p>{n.body}</p>
              <p className="muted small">
                {n.author?.name} · {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
