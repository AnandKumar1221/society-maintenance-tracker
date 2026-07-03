export default function PriorityBadge({ priority }) {
  return <span className={`badge badge-priority-${priority.toLowerCase()}`}>{priority}</span>;
}
