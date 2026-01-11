export async function getCurrentPosition(options = {}) {
  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
    ...options
  };
  
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported by this browser');
  }
  
  return new Promise((resolve, reject) => {
    console.log('[Geolocation] Requesting user location...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('[Geolocation] Position obtained:', {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        resolve(position);
      },
      (error) => {
        console.error('[Geolocation] Error:', error.message);
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Location permission denied by user'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Location information unavailable'));
            break;
          case error.TIMEOUT:
            reject(new Error('Location request timed out'));
            break;
          default:
            reject(new Error('Unknown geolocation error'));
        }
      },
      defaultOptions
    );
  });
}

export async function watchPosition(callback, errorCallback, options = {}) {
  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
    ...options
  };
  
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported by this browser');
  }
  
  console.log('[Geolocation] Starting position watch...');
  
  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      console.log('[Geolocation] Position update:', {
        lat: position.coords.latitude,
        lon: position.coords.longitude
      });
      callback(position);
    },
    (error) => {
      console.error('[Geolocation] Watch error:', error.message);
      if (errorCallback) {
        errorCallback(error);
      }
    },
    defaultOptions
  );
  
  return watchId;
}

export function clearWatch(watchId) {
  if (navigator.geolocation && watchId) {
    navigator.geolocation.clearWatch(watchId);
    console.log('[Geolocation] Position watch cleared');
  }
}

export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}
