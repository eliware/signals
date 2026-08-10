export type NodeSignal = 'SIGTERM' | 'SIGINT' | 'SIGHUP' | (string & {});
export interface ProcessLike {
  on(event: string, listener: (...args: any[]) => void): unknown;
  off?(event: string, listener: (...args: any[]) => void): unknown;
  exit?(code?: number): unknown;
}
export interface SignalsLogger {
  debug(message: string, meta?: unknown): unknown;
  warn(message: string, meta?: unknown): unknown;
  error(message: string, meta?: unknown): unknown;
}
export interface RegisterSignalsOptions {
  processObj?: ProcessLike;
  log?: SignalsLogger;
  signals?: NodeSignal[];
  shutdownHook?: (signal: string) => void | Promise<void>;
  exitCode?: number;
  exit?: boolean;
  signal?: AbortSignal;
}
export interface SignalsRegistration {
  readonly removed: boolean;
  shutdown(signal?: string): Promise<void>;
  getShuttingDown(): boolean;
  removeHandlers(): void;
}
export declare function registerSignals(options?: RegisterSignalsOptions): SignalsRegistration;
export default registerSignals;
