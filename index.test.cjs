// Minimal CommonJS test stub
const registerSignals = require('./index.cjs');
const { test, expect, beforeEach, describe } = require('@jest/globals');

// Support both default and named export
const namedRegisterSignals = registerSignals.registerSignals || registerSignals;
const defaultRegisterSignals = registerSignals.default || registerSignals;

describe('registerSignals (CJS)', () => {
    let mockProcess;
    let mocklog;
    beforeEach(() => {
        mockProcess = {
            on: jest.fn(),
            exit: jest.fn()
        };
        mocklog = {
            debug: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        };
    });

    test('registers signal handlers (named export)', () => {
        namedRegisterSignals({ processObj: mockProcess, log: mocklog });
        expect(mockProcess.on).toHaveBeenCalledWith('SIGTERM', expect.any(Function));
        expect(mockProcess.on).toHaveBeenCalledWith('SIGINT', expect.any(Function));
        expect(mockProcess.on).toHaveBeenCalledWith('SIGHUP', expect.any(Function));
    });

    test('registers signal handlers (default export)', () => {
        defaultRegisterSignals({ processObj: mockProcess, log: mocklog });
        expect(mockProcess.on).toHaveBeenCalledWith('SIGTERM', expect.any(Function));
        expect(mockProcess.on).toHaveBeenCalledWith('SIGINT', expect.any(Function));
        expect(mockProcess.on).toHaveBeenCalledWith('SIGHUP', expect.any(Function));
    });

    test('shutdown sets shuttingDown and calls exit (named export)', async () => {
        const { shutdown, getShuttingDown } = namedRegisterSignals({ processObj: mockProcess, log: mocklog });
        expect(getShuttingDown()).toBe(false);
        await shutdown('SIGTERM');
        expect(getShuttingDown()).toBe(true);
        expect(mocklog.debug).toHaveBeenCalledWith('Received SIGTERM. Shutting down gracefully...');
        expect(mockProcess.exit).toHaveBeenCalledWith(0);
    });

    test('shutdown sets shuttingDown and calls exit (default export)', async () => {
        const { shutdown, getShuttingDown } = defaultRegisterSignals({ processObj: mockProcess, log: mocklog });
        expect(getShuttingDown()).toBe(false);
        await shutdown('SIGTERM');
        expect(getShuttingDown()).toBe(true);
        expect(mocklog.debug).toHaveBeenCalledWith('Received SIGTERM. Shutting down gracefully...');
        expect(mockProcess.exit).toHaveBeenCalledWith(0);
    });

    test('shutdown warns if already shutting down (named export)', async () => {
        const { shutdown } = namedRegisterSignals({ processObj: mockProcess, log: mocklog });
        await shutdown('SIGTERM');
        await shutdown('SIGTERM');
        expect(mocklog.warn).toHaveBeenCalledWith('Received SIGTERM again, but already shutting down.');
    });

    test('shutdown warns if already shutting down (default export)', async () => {
        const { shutdown } = defaultRegisterSignals({ processObj: mockProcess, log: mocklog });
        await shutdown('SIGTERM');
        await shutdown('SIGTERM');
        expect(mocklog.warn).toHaveBeenCalledWith('Received SIGTERM again, but already shutting down.');
    });

    test('shutdown invokes hooks for named export', async () => {
        const hook = jest.fn(async (signal) => {});
        const { shutdown } = namedRegisterSignals({ processObj: mockProcess, log: mocklog, shutdownHook: hook });
        await shutdown('SIGINT');
        expect(hook).toHaveBeenCalledWith('SIGINT');
    });

    test('shutdown invokes hooks for default export', async () => {
        const hook = jest.fn(async (signal) => {});
        const { shutdown } = defaultRegisterSignals({ processObj: mockProcess, log: mocklog, shutdownHook: hook });
        await shutdown('SIGHUP');
        expect(hook).toHaveBeenCalledWith('SIGHUP');
    });
});
