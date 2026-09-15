import { expect, test } from '@jest/globals';
import { getRegistration, setRegistration, deleteRegistration } from '../../src/lifecycle/registration.mjs';

test('stores registrations by process-like object', () => {
  const processObj = {};
  const registration = {};
  setRegistration(processObj, registration);
  expect(getRegistration(processObj)).toBe(registration);
  expect(deleteRegistration(processObj)).toBe(true);
  expect(getRegistration(processObj)).toBeUndefined();
});
