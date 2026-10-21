export const createExitPolicy = ({ processObj, exit, exitCode }) => {
  let requested = false;
  let called = false;

  const request = () => {
    requested = true;
  };
  const afterHooks = () => {
    if (!requested || !exit || typeof processObj.exit !== "function" || called) return;
    called = true;
    processObj.exit(exitCode);
  };

  return { request, afterHooks };
};
