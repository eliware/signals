const registrations = new WeakMap();

export const getRegistration = processObj => registrations.get(processObj);
export const setRegistration = (processObj, registration) => registrations.set(processObj, registration);
export const deleteRegistration = processObj => registrations.delete(processObj);
