require("dotenv").config();

const OVERDUE_DAYS = Number(process.env.OVERDUE_DAYS) || 5;

// A complaint is overdue if it isn't resolved and was created more than
// OVERDUE_DAYS ago. Computed on read (not stored) so it's always accurate
// regardless of when the threshold env var is changed.
function isOverdue(complaint) {
  if (complaint.status === "RESOLVED") return false;
  const ageMs = Date.now() - new Date(complaint.createdAt).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  return ageDays > OVERDUE_DAYS;
}

function attachOverdueFlag(complaintJson) {
  return { ...complaintJson, isOverdue: isOverdue(complaintJson) };
}

module.exports = { OVERDUE_DAYS, isOverdue, attachOverdueFlag };
