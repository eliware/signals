import { deleteRegistration } from "./registration.mjs";

export const createCleanup = ({ processObj, listeners, onBeforeExit, deactivate }) => {
  let removed = false;

  const removeHandlers = () => {
    if (removed) return;
    removed = true;
    deactivate();
    if (typeof processObj.off === "function") {
      for (const [name, listener] of listeners) processObj.off(name, listener);
      processObj.off("beforeExit", onBeforeExit);
    }
    deleteRegistration(processObj);
  };

  return { removeHandlers, getRemoved: () => removed };
};
