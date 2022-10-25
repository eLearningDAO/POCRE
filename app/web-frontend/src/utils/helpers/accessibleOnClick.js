export function accessibleOnClick(handler, tabId) {
  return {
    role: 'button',
    tabIndex: tabId || 0,
    onClick: () => handler(tabId),
  };
}
