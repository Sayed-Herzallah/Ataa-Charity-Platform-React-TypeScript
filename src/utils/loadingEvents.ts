type LoadingCallback = (isLoading: boolean) => void;

class LoadingEventManager {
  private listeners = new Set<LoadingCallback>();
  private activeRequests = 0;

  subscribe(listener: LoadingCallback) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  start() {
    this.activeRequests++;
    if (this.activeRequests === 1) {
      this.listeners.forEach(l => l(true));
    }
  }

  stop() {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    if (this.activeRequests === 0) {
      this.listeners.forEach(l => l(false));
    }
  }
}

export const loadingEvents = new LoadingEventManager();
