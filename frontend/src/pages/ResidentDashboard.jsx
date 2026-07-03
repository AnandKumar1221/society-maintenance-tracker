import { useEffect, useState } from "react";
import client from "../api/client";
import ComplaintCard from "../components/ComplaintCard.jsx";

const CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Lift / Elevator",
  "Security",
  "Cleaning / Housekeeping",
  "Parking",
  "Common Area Damage",
  "Other",
];

export default function ResidentDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    client
      .get("/complaints/mine")
      .then((res) => setComplaints(res.data.complaints))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("category", category);
      formData.append("description", description);
      if (photo) formData.append("photo", photo);

      await client.post("/complaints", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setDescription("");
      setPhoto(null);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Could not raise complaint");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>My Complaints</h1>
        <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "+ Raise a Complaint"}
        </button>
      </div>

      {showForm && (
        <form className="card form" onSubmit={handleSubmit}>
          <label>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            Description
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
            />
          </label>
          <label>
            Photo (optional)
            <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} />
          </label>
          {error && <div className="error">{error}</div>}
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Complaint"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="muted">Loading...</p>
      ) : complaints.length === 0 ? (
        <p className="muted">You haven't raised any complaints yet.</p>
      ) : (
        <div className="card-grid">
          {complaints.map((c) => (
            <ComplaintCard key={c.id} complaint={c} />
          ))}
        </div>
      )}
    </div>
  );
}
