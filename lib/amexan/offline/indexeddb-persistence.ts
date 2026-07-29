export interface IDBStoreSchema {
  name: string;
  keyPath: string;
  indexes?: { name: string; keyPath: string; unique?: boolean }[];
}

export interface IDBConfig {
  dbName: string;
  version: number;
  stores: IDBStoreSchema[];
}

const DEFAULT_CONFIG: IDBConfig = {
  dbName: 'AMEXAN_Offline',
  version: 1,
  stores: [
    { name: 'patients', keyPath: 'id', indexes: [{ name: 'mrn', keyPath: 'mrn', unique: true }, { name: 'name', keyPath: 'name' }] },
    { name: 'encounters', keyPath: 'id', indexes: [{ name: 'patientId', keyPath: 'patientId' }, { name: 'status', keyPath: 'status' }] },
    { name: 'observations', keyPath: 'id', indexes: [{ name: 'patientId', keyPath: 'patientId' }, { name: 'code', keyPath: 'code' }] },
    { name: 'queue', keyPath: 'id', indexes: [{ name: 'status', keyPath: 'status' }, { name: 'entityType', keyPath: 'entityType' }] },
    { name: 'cache_metadata', keyPath: 'key' },
  ],
};

export class IndexedDBPersistence {
  private config: IDBConfig;
  private db: IDBDatabase | null = null;

  constructor(config?: Partial<IDBConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config, stores: config?.stores || DEFAULT_CONFIG.stores };
  }

  async open(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.version);
      request.onupgradeneeded = () => {
        const db = request.result;
        for (const store of this.config.stores) {
          if (!db.objectStoreNames.contains(store.name)) {
            const objStore = db.createObjectStore(store.name, { keyPath: store.keyPath });
            for (const idx of store.indexes || []) {
              objStore.createIndex(idx.name, idx.keyPath, { unique: idx.unique || false });
            }
          }
        }
      };
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db!);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  private async getDb(): Promise<IDBDatabase> {
    return this.db || this.open();
  }

  async put(storeName: string, value: unknown): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.put(value);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async get<T>(storeName: string, key: string): Promise<T | null> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async queryByIndex<T>(storeName: string, indexName: string, value: string): Promise<T[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, key: string): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async count(storeName: string): Promise<number> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getStorageEstimate(): Promise<{ usage: number; quota: number }> {
    if (navigator.storage && navigator.storage.estimate) {
      const est = await navigator.storage.estimate();
      return { usage: est.usage ?? 0, quota: est.quota ?? 0 };
    }
    return { usage: 0, quota: 0 };
  }

  async exportAll(): Promise<Record<string, unknown[]>> {
    const db = await this.getDb();
    const result: Record<string, unknown[]> = {};
    for (const store of this.config.stores) {
      result[store.name] = await this.getAll(store.name);
    }
    return result;
  }

  async importAll(data: Record<string, unknown[]>): Promise<void> {
    const db = await this.getDb();
    for (const storeName of Object.keys(data)) {
      if (db.objectStoreNames.contains(storeName)) {
        await this.clear(storeName);
        for (const item of data[storeName]) {
          await this.put(storeName, item);
        }
      }
    }
  }
}

export const offlineDB = new IndexedDBPersistence();
