/**
 * Online API Mock
 * Simulates online API responses with richer data
 * In production, this would call real APIs
 */

/**
 * Fetch online locations with additional data
 * Returns more locations and richer information when online
 * Uses Overpass API for real POI data if coordinates provided
 * @param {number} lat - User latitude (optional)
 * @param {number} lon - User longitude (optional)
 * @returns {Promise<Array>} Enhanced locations
 */
export async function fetchOnlineLocations(lat, lon) {
  console.log('[Online API] Fetching locations from server...');
  
  // If user location provided, try to fetch real nearby POIs
  if (lat && lon) {
    try {
      const realLocations = await fetchNearbyPOIs(lat, lon);
      if (realLocations.length > 0) {
        console.log(`[Online API] Found ${realLocations.length} real nearby locations`);
        return [...getStaticOnlineLocations(), ...realLocations];
      }
    } catch (error) {
      console.warn('[Online API] Failed to fetch real POIs, using static data:', error);
    }
  }
  
  // Fallback to static locations
  await new Promise(resolve => setTimeout(resolve, 800));
  return getStaticOnlineLocations();
}

/**
 * Fetch real POIs using Overpass API (OpenStreetMap)
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} radius - Search radius in meters
 * @returns {Promise<Array>} Real locations
 */
async function fetchNearbyPOIs(lat, lon, radius = 2000) {
  try {
    // Overpass API query for various POI types
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"~"restaurant|cafe|hospital|pharmacy|police"](around:${radius},${lat},${lon});
        node["tourism"~"museum|attraction|hotel"](around:${radius},${lat},${lon});
        node["shop"~"mall|supermarket"](around:${radius},${lat},${lon});
      );
      out body;
    `;
    
    const url = 'https://overpass-api.de/api/interpreter';
    const response = await fetch(url, {
      method: 'POST',
      body: query
    });
    
    if (!response.ok) {
      throw new Error('Overpass API failed');
    }
    
    const data = await response.json();
    
    // Convert OSM data to our format
    return data.elements.slice(0, 20).map((element, index) => {
      const category = getCategoryFromOSM(element.tags);
      
      return {
        id: `osm-${element.id}`,
        name: element.tags.name || element.tags.amenity || 'Unknown Place',
        category: category,
        type: element.tags.amenity || element.tags.tourism || element.tags.shop || 'Place',
        description: element.tags.description || `Real location from OpenStreetMap`,
        lat: element.lat,
        lon: element.lon,
        address: formatOSMAddress(element.tags),
        hours: element.tags.opening_hours || 'Hours not available',
        phone: element.tags.phone || element.tags['contact:phone'],
        website: element.tags.website || element.tags['contact:website'],
        rating: 4.0 + Math.random(),
        reviewCount: Math.floor(Math.random() * 200) + 50,
        openNow: true,
        amenities: getAmenitiesFromOSM(element.tags)
      };
    });
  } catch (error) {
    console.warn('[Overpass API] Failed:', error);
    return [];
  }
}

/**
 * Get category from OSM tags
 */
function getCategoryFromOSM(tags) {
  if (tags.amenity === 'restaurant' || tags.amenity === 'cafe') return 'restaurant';
  if (tags.amenity === 'hospital' || tags.amenity === 'pharmacy') return 'hospital';
  if (tags.amenity === 'police') return 'police';
  if (tags.tourism) return 'tourist';
  if (tags.shop) return 'shopping';
  return 'tourist';
}

/**
 * Format OSM address
 */
function formatOSMAddress(tags) {
  const parts = [];
  if (tags['addr:street']) parts.push(tags['addr:street']);
  if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
  if (tags['addr:city']) parts.push(tags['addr:city']);
  return parts.join(', ') || 'Address not available';
}

/**
 * Get amenities from OSM tags
 */
function getAmenitiesFromOSM(tags) {
  const amenities = [];
  if (tags.wifi === 'yes' || tags.internet_access === 'wlan') amenities.push('WiFi');
  if (tags.wheelchair === 'yes') amenities.push('Wheelchair Accessible');
  if (tags.outdoor_seating === 'yes') amenities.push('Outdoor Seating');
  if (tags.takeaway === 'yes') amenities.push('Takeout');
  if (tags.delivery === 'yes') amenities.push('Delivery');
  return amenities;
}

/**
 * Get static online locations (fallback)
 */
function getStaticOnlineLocations() {
  // Additional online-only locations
  const onlineLocations = [
    // Restaurants & Cafes
    {
      id: 'restaurant-1',
      name: 'Restauracja Polska Różana',
      category: 'restaurant',
      type: 'Traditional Polish Restaurant',
      description: 'Authentic Polish cuisine in an elegant setting. Famous for pierogi and żurek soup.',
      lat: 52.2319,
      lon: 21.0140,
      address: 'Chocimska 7, Śródmieście',
      hours: 'Mon-Sun: 12:00 PM - 11:00 PM',
      phone: '+48 22 848 12 25',
      website: 'https://rozana.pl',
      priceRange: '$$',
      rating: 4.5,
      reviewCount: 342,
      photos: ['restaurant1.jpg'],
      amenities: ['WiFi', 'Outdoor Seating', 'Reservations'],
      popular: true,
      openNow: true
    },
    {
      id: 'cafe-1',
      name: 'Kawiarnia Kafka',
      category: 'restaurant',
      type: 'Cafe & Bookstore',
      description: 'Cozy cafe with extensive book collection. Perfect for reading and working.',
      lat: 52.2285,
      lon: 21.0110,
      address: 'Oboźna 3, Śródmieście',
      hours: 'Mon-Fri: 8:00 AM - 10:00 PM, Sat-Sun: 9:00 AM - 11:00 PM',
      phone: '+48 22 826 08 22',
      priceRange: '$',
      rating: 4.7,
      reviewCount: 521,
      amenities: ['WiFi', 'Books', 'Quiet'],
      openNow: true
    },
    {
      id: 'restaurant-2',
      name: 'Sushi Kushi',
      category: 'restaurant',
      type: 'Japanese Restaurant',
      description: 'Modern Japanese restaurant with fresh sushi and ramen.',
      lat: 52.2310,
      lon: 21.0095,
      address: 'Nowy Świat 22, Śródmieście',
      hours: 'Mon-Sun: 12:00 PM - 10:00 PM',
      phone: '+48 22 828 00 33',
      priceRange: '$$',
      rating: 4.3,
      reviewCount: 287,
      amenities: ['Delivery', 'Takeout', 'WiFi'],
      openNow: true
    },
    
    // Shopping
    {
      id: 'shopping-1',
      name: 'Złote Tarasy',
      category: 'shopping',
      type: 'Shopping Mall',
      description: 'Modern shopping center with 200+ stores, restaurants, and cinema.',
      lat: 52.2291,
      lon: 21.0025,
      address: 'Złota 59, Śródmieście',
      hours: 'Mon-Sun: 9:00 AM - 10:00 PM',
      phone: '+48 22 222 22 00',
      website: 'https://zlotetarasy.pl',
      rating: 4.4,
      reviewCount: 1523,
      amenities: ['Parking', 'WiFi', 'Food Court', 'Cinema'],
      popular: true,
      openNow: true
    },
    {
      id: 'shopping-2',
      name: 'Hala Koszyki',
      category: 'shopping',
      type: 'Food Hall & Market',
      description: 'Historic market hall with food stalls, restaurants, and local products.',
      lat: 52.2245,
      lon: 21.0155,
      address: 'Koszykowa 63, Śródmieście',
      hours: 'Mon-Sun: 8:00 AM - 11:00 PM',
      phone: '+48 22 828 98 00',
      rating: 4.6,
      reviewCount: 892,
      amenities: ['Food Court', 'Local Products', 'Events'],
      popular: true,
      openNow: true
    },
    
    // Hotels
    {
      id: 'hotel-1',
      name: 'Hotel Bristol',
      category: 'hotel',
      type: 'Luxury Hotel',
      description: 'Historic 5-star hotel in the heart of Warsaw. Art Nouveau architecture.',
      lat: 52.2395,
      lon: 21.0150,
      address: 'Krakowskie Przedmieście 42/44',
      hours: '24/7',
      phone: '+48 22 551 10 00',
      website: 'https://hotelbristolwarsaw.pl',
      priceRange: '$$$$',
      rating: 4.8,
      reviewCount: 1247,
      amenities: ['Spa', 'Restaurant', 'Bar', 'Concierge', 'WiFi'],
      popular: true
    },
    {
      id: 'hotel-2',
      name: 'Novotel Warszawa Centrum',
      category: 'hotel',
      type: 'Business Hotel',
      description: 'Modern hotel with panoramic city views and conference facilities.',
      lat: 52.2320,
      lon: 21.0050,
      address: 'Marszałkowska 94/98',
      hours: '24/7',
      phone: '+48 22 596 00 00',
      priceRange: '$$',
      rating: 4.2,
      reviewCount: 634,
      amenities: ['Gym', 'Restaurant', 'Conference Rooms', 'WiFi'],
      openNow: true
    },
    
    // Entertainment
    {
      id: 'entertainment-1',
      name: 'Kinoteka',
      category: 'entertainment',
      type: 'Art Cinema',
      description: 'Independent cinema showing art-house and international films.',
      lat: 52.2415,
      lon: 21.0175,
      address: 'Pałac Kultury i Nauki',
      hours: 'Mon-Sun: 10:00 AM - 11:00 PM',
      phone: '+48 22 110 61 66',
      rating: 4.5,
      reviewCount: 423,
      amenities: ['Cafe', 'Film Library'],
      openNow: true
    },
    {
      id: 'entertainment-2',
      name: 'Teatr Wielki',
      category: 'entertainment',
      type: 'Opera House',
      description: 'National Opera and Ballet theater. World-class performances.',
      lat: 52.2405,
      lon: 21.0125,
      address: 'Plac Teatralny 1',
      hours: 'Box Office: Mon-Sat: 10:00 AM - 7:00 PM',
      phone: '+48 22 692 02 00',
      website: 'https://teatrwielki.pl',
      rating: 4.7,
      reviewCount: 856,
      amenities: ['Guided Tours', 'Restaurant'],
      popular: true
    },
    
    // Parks & Recreation
    {
      id: 'park-1',
      name: 'Łazienki Park',
      category: 'tourist',
      type: 'Royal Park',
      description: 'Beautiful 76-hectare park with palace, gardens, and peacocks. Free Chopin concerts in summer.',
      lat: 52.2156,
      lon: 21.0352,
      address: 'Agrykoli 1',
      hours: 'Daily: 6:00 AM - 10:00 PM',
      phone: '+48 22 506 00 28',
      rating: 4.9,
      reviewCount: 3421,
      amenities: ['Free Entry', 'Gardens', 'Museum', 'Cafe'],
      popular: true,
      essential: true
    },
    {
      id: 'park-2',
      name: 'Pole Mokotowskie',
      category: 'tourist',
      type: 'Urban Park',
      description: 'Large park perfect for jogging, cycling, and picnics.',
      lat: 52.2045,
      lon: 21.0285,
      address: 'Pole Mokotowskie',
      hours: '24/7',
      rating: 4.4,
      reviewCount: 567,
      amenities: ['Running Track', 'Playground', 'Dog Park'],
      openNow: true
    },
    
    // Services
    {
      id: 'service-1',
      name: 'Warsaw Tourist Information',
      category: 'tourist',
      type: 'Tourist Information Center',
      description: 'Official tourist information center. Maps, guides, and assistance.',
      lat: 52.2480,
      lon: 21.0130,
      address: 'Plac Zamkowy 1/13',
      hours: 'Mon-Sun: 9:00 AM - 6:00 PM',
      phone: '+48 22 194 31',
      rating: 4.3,
      reviewCount: 234,
      amenities: ['Free Maps', 'Multilingual Staff', 'WiFi'],
      essential: true,
      openNow: true
    },
    {
      id: 'service-2',
      name: 'Apteka 24h',
      category: 'hospital',
      type: '24h Pharmacy',
      description: '24-hour pharmacy with English-speaking staff.',
      lat: 52.2330,
      lon: 21.0115,
      address: 'Marszałkowska 104',
      hours: '24/7',
      phone: '+48 22 825 69 86',
      rating: 4.1,
      reviewCount: 178,
      amenities: ['24/7', 'English Speaking'],
      essential: true
    }
  ];
  
  console.log(`[Online API] Fetched ${onlineLocations.length} additional online locations`);
  
  return onlineLocations;
}

/**
 * Get live location details (opening hours, current status)
 * @param {string} locationId - Location ID
 * @returns {Promise<Object>} Live location data
 */
export async function fetchLocationDetails(locationId) {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const now = new Date();
  const hour = now.getHours();
  
  // Simulate live data
  return {
    openNow: hour >= 8 && hour < 22,
    currentVisitors: Math.floor(Math.random() * 100),
    waitTime: Math.floor(Math.random() * 30),
    lastUpdated: now.toISOString(),
    specialEvents: hour >= 18 ? ['Happy Hour: 6-8 PM'] : []
  };
}

/**
 * Get weather information for a location
 * Uses OpenWeather API for real weather data
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Weather data
 */
export async function fetchWeather(lat = 52.2297, lon = 21.0122) {
  try {
    // Try wttr.in API first (free, no key required)
    const url = `https://wttr.in/${lat},${lon}?format=j1`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Weather API failed');
    }
    
    const data = await response.json();
    const current = data.current_condition[0];
    const location = data.nearest_area[0];
    
    // Map weather codes to emojis
    const weatherCode = parseInt(current.weatherCode);
    let icon = '🌤️';
    
    if (weatherCode === 113) icon = '☀️'; // Sunny
    else if (weatherCode === 116) icon = '⛅'; // Partly cloudy
    else if (weatherCode === 119 || weatherCode === 122) icon = '☁️'; // Cloudy
    else if (weatherCode >= 176 && weatherCode <= 200) icon = '🌧️'; // Rain
    else if (weatherCode >= 227 && weatherCode <= 230) icon = '🌨️'; // Snow
    else if (weatherCode >= 248 && weatherCode <= 260) icon = '🌫️'; // Fog
    else if (weatherCode >= 263 && weatherCode <= 284) icon = '🌦️'; // Light rain
    else if (weatherCode >= 293 && weatherCode <= 302) icon = '🌧️'; // Rain
    else if (weatherCode >= 308 && weatherCode <= 314) icon = '⛈️'; // Heavy rain
    else if (weatherCode >= 323 && weatherCode <= 338) icon = '❄️'; // Snow
    else if (weatherCode >= 350 && weatherCode <= 377) icon = '🌨️'; // Sleet/snow
    else if (weatherCode >= 386 && weatherCode <= 395) icon = '⛈️'; // Thunder
    
    return {
      temperature: parseInt(current.temp_C),
      condition: current.weatherDesc[0].value,
      description: current.weatherDesc[0].value.toLowerCase(),
      humidity: parseInt(current.humidity),
      icon: icon,
      location: location.areaName[0].value,
      feelsLike: parseInt(current.FeelsLikeC),
      windSpeed: parseInt(current.windspeedKmph)
    };
  } catch (error) {
    console.warn('[Weather API] wttr.in failed, trying OpenWeather:', error);
    
    // Try OpenWeather as backup
    try {
      const API_KEY = 'demo'; // User can add their own key
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        
        const iconMap = {
          '01d': '☀️', '01n': '🌙',
          '02d': '⛅', '02n': '☁️',
          '03d': '☁️', '03n': '☁️',
          '04d': '☁️', '04n': '☁️',
          '09d': '🌧️', '09n': '🌧️',
          '10d': '🌦️', '10n': '🌧️',
          '11d': '⛈️', '11n': '⛈️',
          '13d': '❄️', '13n': '❄️',
          '50d': '🌫️', '50n': '🌫️'
        };
        
        return {
          temperature: Math.round(data.main.temp),
          condition: data.weather[0].main,
          description: data.weather[0].description,
          humidity: data.main.humidity,
          icon: iconMap[data.weather[0].icon] || '🌤️',
          location: data.name
        };
      }
    } catch (openWeatherError) {
      console.warn('[Weather API] OpenWeather also failed:', openWeatherError);
    }
    
    console.warn('[Weather API] All APIs failed, using realistic fallback');
    
    // Fallback to realistic mock data for Warsaw
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const hour = now.getHours();
    
    // Seasonal temperature ranges for Warsaw
    let tempRange;
    if (month >= 11 || month <= 1) { // Winter
      tempRange = [-5, 5];
    } else if (month >= 2 && month <= 4) { // Spring
      tempRange = [5, 15];
    } else if (month >= 5 && month <= 8) { // Summer
      tempRange = [15, 25];
    } else { // Fall
      tempRange = [5, 15];
    }
    
    const temp = Math.floor(Math.random() * (tempRange[1] - tempRange[0])) + tempRange[0];
    
    // Realistic conditions based on time and season
    let condition, icon;
    if (hour >= 6 && hour <= 18) {
      condition = temp > 15 ? 'Clear' : temp < 0 ? 'Snow' : 'Clouds';
      icon = temp > 15 ? '☀️' : temp < 0 ? '❄️' : '☁️';
    } else {
      condition = 'Clear';
      icon = '🌙';
    }
    
    return {
      temperature: temp,
      condition,
      description: condition.toLowerCase(),
      humidity: Math.floor(Math.random() * 30) + 50,
      icon,
      location: 'Warsaw'
    };
  }
}

/**
 * Get trending locations
 * @returns {Promise<Array>} Trending location IDs
 */
export async function fetchTrendingLocations() {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return [
    'park-1',
    'restaurant-1',
    'shopping-1',
    'entertainment-2',
    'cafe-1'
  ];
}

/**
 * Search locations by query
 * @param {string} query - Search query
 * @returns {Promise<Array>} Search results
 */
export async function searchLocations(query) {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const allLocations = await fetchOnlineLocations();
  const lowerQuery = query.toLowerCase();
  
  return allLocations.filter(loc => 
    loc.name.toLowerCase().includes(lowerQuery) ||
    loc.type.toLowerCase().includes(lowerQuery) ||
    loc.description.toLowerCase().includes(lowerQuery)
  );
}
