// Tells the navbar badge that notifications changed.
// - with a known count: the navbar just shows it (no extra request)
// - without: the navbar re-reads the unread count from the API
export const announceNotifications = (unreadCount) =>
  window.dispatchEvent(
    new CustomEvent('fitpulse:notifications-changed', { detail: Number.isFinite(unreadCount) ? { unreadCount } : {} })
  );
