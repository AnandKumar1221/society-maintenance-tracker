const LABELS = { OPEN: "Open", IN_PROGRESS: "In Progress", RESOLVED: "Resolved" };

export default function StatusBadge({ status }) {
  return <span className={`badge badge-status-${status.toLowerCase()}`}>{LABELS[status]}</span>;
}
