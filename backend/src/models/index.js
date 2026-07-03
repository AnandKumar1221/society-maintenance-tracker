const User = require("./User");
const Complaint = require("./Complaint");
const ComplaintHistory = require("./ComplaintHistory");
const Notice = require("./Notice");

// A resident raises many complaints
User.hasMany(Complaint, { foreignKey: "residentId", as: "complaints" });
Complaint.belongsTo(User, { foreignKey: "residentId", as: "resident" });

// A complaint has many history entries (status lifecycle), oldest first
Complaint.hasMany(ComplaintHistory, {
  foreignKey: "complaintId",
  as: "history",
  onDelete: "CASCADE",
});
ComplaintHistory.belongsTo(Complaint, { foreignKey: "complaintId", as: "complaint" });

// Each history entry records who made the change (the "actor": resident or admin)
User.hasMany(ComplaintHistory, { foreignKey: "actorId", as: "actions" });
ComplaintHistory.belongsTo(User, { foreignKey: "actorId", as: "actor" });

// Notices are authored by an admin
User.hasMany(Notice, { foreignKey: "authorId", as: "notices" });
Notice.belongsTo(User, { foreignKey: "authorId", as: "author" });

module.exports = { User, Complaint, ComplaintHistory, Notice };
