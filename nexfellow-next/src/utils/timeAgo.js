export default function timeAgo(date) {

  const now = new Date();
  const created = new Date(date);
  const diff = Math.floor((now - created) / 1000); // in seconds

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hour ago`;
  if (diff < 172800) return '1 day ago';
  return `${Math.floor(diff / 86400)} days ago`;
}
