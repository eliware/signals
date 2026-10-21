import { createAbortCleanup } from "./cleanup.mjs";

export const createAbortRegistration = ({ signal, removeHandlers }) => {
  let abortCleanup;
  const cleanup = () => {
    abortCleanup.remove();
    removeHandlers();
  };
  abortCleanup = createAbortCleanup({ signal, onAbort: cleanup });

  return { attach: abortCleanup.attach, removeHandlers: cleanup };
};
