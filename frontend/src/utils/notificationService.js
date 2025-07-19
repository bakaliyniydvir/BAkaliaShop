let notifyHandler = null;
export const registerNotifyHandler = handler => {
  notifyHandler = handler;
};
export const notify = msg => {
  if (notifyHandler) notifyHandler(msg);
};
