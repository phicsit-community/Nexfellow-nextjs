const ROLE_OPTIONS = [
  { label: "Member", value: "member" },
  { label: "Moderator", value: "moderator" },
  { label: "Event Admin", value: "event-admin" },
  { label: "Content Admin", value: "content-admin" },
  { label: "Analyst", value: "analyst" },
];

const ROLE_PRIVILEGES = {
  member: ["View Posts"],
  moderator: [
    "Moderate Discussions",
    "Manage Forum Threads",
    "Pin/Unpin Topics",
  ],
  "event-admin": [
    "Manage Challenges",
    "Manage Contests",
    "Manage Events",
    "Send Broadcasts",
  ],
  "content-admin": [
    "Create Posts",
    "Delete Posts",
    "Pin/Unpin Posts",
    "Delete Comments",
  ],
  analyst: ["View Analytics", "Download Reports", "Access Insights"],
  owner: ["All Admin Privileges", "Transfer Ownership", "Delete Community"],
};

module.exports = { ROLE_OPTIONS, ROLE_PRIVILEGES };
