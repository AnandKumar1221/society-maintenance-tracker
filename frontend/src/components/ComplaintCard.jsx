import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge.jsx";
import PriorityBadge from "./PriorityBadge.jsx";

export default function ComplaintCard({ complaint, showResident }) {
  return (
    <Link to={`/complaints/${complaint.id}`} className={`card complaint-card ${complaint.isOverdue ? "overdue" : ""}`}>
      <div className="complaint-card-top">
        <span className="complaint-id">#{complaint.id}</span>
        <StatusBadge status={complaint.status} />
        <PriorityBadge priority={complaint.priority} />
        {complaint.isOverdue && <span className="badge badge-overdue">Overdue</span>}
      </div>
      <h3>{complaint.category}</h3>
      <p className="complaint-desc">{complaint.description}</p>
      {showResident && complaint.resident && (
        <p className="muted small">
          {complaint.resident.name} · Flat {complaint.resident.flatNumber || "-"}
        </p>
      )}
      <p className="muted small">Raised {new Date(complaint.createdAt).toLocaleString()}</p>
    </Link>
  );
}
