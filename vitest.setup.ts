class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length() {
    return this.store.size;
  }

  clear() {
    this.store.clear();
  }

  getItem(key: string) {
    return this.store.get(key) ?? null;
  }

  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.store.delete(key);
  }

  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }
}

function installStorage(name: 'localStorage' | 'sessionStorage') {
  const current = globalThis[name];
  if (typeof current?.clear === 'function') return;

  const storage = new MemoryStorage();
  Object.defineProperty(globalThis, name, {
    configurable: true,
    value: storage,
  });

  if (typeof window !== 'undefined') {
    Object.defineProperty(window, name, {
      configurable: true,
      value: storage,
    });
  }
}

installStorage('localStorage');
installStorage('sessionStorage');
