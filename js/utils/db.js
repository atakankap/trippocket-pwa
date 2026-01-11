const DB_NAME = 'TripPocketDB';
const DB_VERSION = 1;
const STORE_NAME = 'savedLocations';

let db = null;

export async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      console.error('[DB] Error opening database:', request.error);
      reject(request.error);
    };
    
    request.onsuccess = () => {
      db = request.result;
      console.log('[DB] Database opened successfully');
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('savedAt', 'savedAt', { unique: false });
        objectStore.createIndex('category', 'category', { unique: false });
        console.log('[DB] Object store created');
      }
    };
  });
}

export async function saveLocation(locationId) {
  if (!db) {
    await initDB();
  }
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    
    const location = {
      id: locationId,
      savedAt: new Date().toISOString()
    };
    
    const request = objectStore.put(location);
    
    request.onsuccess = () => {
      console.log('[DB] Location saved:', locationId);
      resolve();
    };
    
    request.onerror = () => {
      console.error('[DB] Error saving location:', request.error);
      reject(request.error);
    };
  });
}

export async function getSavedLocations() {
  if (!db) {
    await initDB();
  }
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.getAll();
    
    request.onsuccess = () => {
      const savedIds = request.result;
      console.log('[DB] Retrieved saved locations:', savedIds.length);
      resolve(savedIds);
    };
    
    request.onerror = () => {
      console.error('[DB] Error getting saved locations:', request.error);
      reject(request.error);
    };
  });
}

export async function removeLocation(locationId) {
  if (!db) {
    await initDB();
  }
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.delete(locationId);
    
    request.onsuccess = () => {
      console.log('[DB] Location removed:', locationId);
      resolve();
    };
    
    request.onerror = () => {
      console.error('[DB] Error removing location:', request.error);
      reject(request.error);
    };
  });
}

export async function isLocationSaved(locationId) {
  if (!db) {
    await initDB();
  }
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.get(locationId);
    
    request.onsuccess = () => {
      resolve(!!request.result);
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}
