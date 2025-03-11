// logger.ts

export interface ILogger {
  log(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
  debug(...args: any[]): void;
}

/**
 * Logger is a configurable logger that by default delegates to console.
 * It exposes the same methods as console and can be toggled on or off.
 * It also provides a generic proxy that wraps any object's methods to log calls and returns.
 */
export class Logger implements ILogger {
  private _enabled: boolean;
  public target: ILogger;

  constructor(target?: ILogger, enabled?: boolean) {
    this.target = target || console;
    this._enabled = enabled || true;
  }

  // Toggle logging on or off.
  set enabled(value: boolean) {
    this._enabled = value;
  }
  get enabled(): boolean {
    return this._enabled;
  }

  log(...args: any[]): void {
    if (this._enabled) {
      this.target.log(...args);
    }
  }

  info(...args: any[]): void {
    if (this._enabled) {
      this.target.info(...args);
    }
  }

  warn(...args: any[]): void {
    if (this._enabled) {
      this.target.warn(...args);
    }
  }

  error(...args: any[]): void {
    if (this._enabled) {
      this.target.error(...args);
    }
  }

  debug(...args: any[]): void {
    if (this._enabled) {
      // Some environments might not have console.debug, so fallback to log.
      if (this.target.debug) {
        this.target.debug(...args);
      } else {
        this.target.log(...args);
      }
    }
  }

  /**
   * Returns a proxy that wraps the provided object so that every function call is logged.
   * @param obj The object to wrap.
   * @param objName A label for logging the object's method calls.
   */
  proxy<T extends object>(obj: T, objName: string): T {
    const self = this;
    return new Proxy(obj, {
      get(target, prop, receiver) {
        const orig = Reflect.get(target, prop, receiver);
        if (typeof orig === "function") {
          return (...args: any[]) => {
            self.log(`[${objName}] ${String(prop)} called with:`, ...args);
            const result = orig.apply(this, args);
            self.log(`[${objName}] ${String(prop)} returned:`, result);
            return result;
          };
        }
        return orig;
      },
    });
  }
}
