import { deleteRegistration } from "./registration.mjs";
import { createAbortCleanup } from "./abort-cleanup.mjs";

export const createCleanup = ({ processObj, signal, listeners, onBeforeExit, deactivate }) => {
  let removed = false;

  const removeHandlers = () => {
    if (removed) return;
    removed = true;
    deactivate();
    if (typeof processObj.off === "function") {
      for (const [name, listener] of listeners) processObj.off(name, listener);
      processObj.off("beforeExit", onBeforeExit);
    }
    abortCleanup.remove();
    deleteRegistration(processObj);
  };
  const abortCleanup = createAbortCleanup({ signal, onAbort: removeHandlers });

  return { removeHandlers, attachAbortHandler: abortCleanup.attach, getRemoved: () => removed };
};
