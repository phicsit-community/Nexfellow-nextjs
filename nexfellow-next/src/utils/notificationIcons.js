// Maps a system notification's exact title to its icon in public/notificationIcons/.
// Titles here must stay in sync with the titles the backend sets when it creates
// these notifications (see backend/controllers/Payments.js and services/creditService.js).
const ICON_FILE_BY_TITLE = {
  "Builder Plan": "Builder Plan.png",
  "Founder Plan": "Founder Plan.png",
  "Credits earned": "Credits earned.png",
  "Credits deducted": "Credits deducted.png",
};

export function getNotificationIcon(notification) {
  const fileName = notification?.title && ICON_FILE_BY_TITLE[notification.title];
  if (!fileName) return null;
  return `/notificationIcons/${encodeURIComponent(fileName)}`;
}
