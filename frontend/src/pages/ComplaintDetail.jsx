import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import client, { fileBaseUrl } from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import PriorityBadge from "../components/PriorityBadge.jsx";

const STATUS_FLOW = ["OPEN", "IN_PROGRESS", "RESOLVED"];

export default function ComplaintDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function load() {
    client.get(`/complaints/${id}`).then((res) => setComplaint(res.data.complaint));
  }

  useEffect(load, [id]);

  async function updateStatus(status) {
    setError("");
    setBusy(true);
    try {
      await client.patch(`/complaints/${id}/status`, { status, note: note || undefined });
      setNote("");
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Could not update status");
    } finally {
      setBusy(false);
    }
  }

  async function updatePriority(priority) {
    await client.patch(`/complaints/${id}/priority`, { priority });
    load();
  }

  if (!complaint) return <p className="muted">Loading...</p>;

  const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(complaint.status) + 1];

  return (
    <div>
      <Link to="/" className="back-link">
        ← Back
      </Link>
      <div className="card">
        <div className="complaint-card-top">
          <span className="complaint-id">#{complaint.id}</span>
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
          {complaint.isOverdue && <span className="badge badge-overdue">Overdue</span>}
        </div>
        <h1>{complaint.category}</h1>
        <p>{complaint.description}</p>
        {complaint.photoUrl && (
          <img className="complaint-photo" src={`${fileBaseUrl}${complaint.photoUrl}`} alt="Complaint" />
        )}
        {complaint.resident && (
          <p className="muted small">
            Raised by {complaint.resident.name} (Flat {complaint.resident.flatNumber || "-"})
          </p>
        )}

        {user.role === "ADMIN" && complaint.status !== "RESOLVED" && (
          <div className="admin-actions">
            <h3>Admin actions</h3>
            <div className="row">
              <label>
                Priority
                <select value={complaint.priority} onChange={(e) => updatePriority(e.target.value)}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </label>
            </div>
            <label>
              Note (optional)
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Plumber scheduled for tomorrow" />
            </label>
            {error && <div className="error">{error}</div>}
            <div className="row">
              {nextStatus && (
                <button className="btn-primary" disabled={busy} onClick={() => updateStatus(nextStatus)}>
                  Move to {nextStatus.replace("_", " ")}
                </button>
              )}
              {complaint.status !== "RESOLVED" && (
                <button className="btn-secondary" disabled={busy} onClick={() => updateStatus("RESOLVED")}>
                  Mark Resolved
                </button>
              )}
            </div>
          </div>
        )}

        <h3>Status History</h3>
        <ul className="history-list">
          {complaint.history.map((h) => (
            <li key={h.id}>
              <StatusBadge status={h.status} />
              <span className="history-meta">
                {new Date(h.createdAt).toLocaleString()} · {h.actor?.name} ({h.actor?.role})
              </span>
              {h.note && <p className="history-note">{h.note}</p>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
