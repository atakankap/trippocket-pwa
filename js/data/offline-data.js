/**
 * Offline Location Data for Warsaw, Poland
 * Contains essential locations available without internet connection
 * Categories: transport, hospital, police, tourist
 */

export function getOfflineLocations() {
  return [
    {
      id: 'metro-1',
      name: 'Centrum Metro Station',
      category: 'transport',
      type: 'Metro Station',
      description: 'Main metro hub in city center, M1 and M2 lines intersection. Direct access to shopping centers and business district.',
      lat: 52.2297,
      lon: 21.0122,
      essential: true,
      address: 'Centrum, Śródmieście',
      hours: '5:00 AM - 1:00 AM',
      phone: '+48 22 194 84',
      facilities: ['Ticket machines', 'Elevators', 'WiFi'],
      accessibility: true
    },
    {
      id: 'metro-2',
      name: 'Świętokrzyska Metro Station',
      category: 'transport',
      type: 'Metro Station',
      description: 'Transfer station between M1 and M2 lines',
      lat: 52.2324,
      lon: 21.0131,
      essential: true,
      address: 'Świętokrzyska, Śródmieście'
    },
    {
      id: 'metro-3',
      name: 'Dworzec Centralny',
      category: 'transport',
      type: 'Train Station',
      description: 'Warsaw Central Railway Station',
      lat: 52.2290,
      lon: 21.0031,
      essential: true,
      address: 'Aleje Jerozolimskie 54'
    },
    {
      id: 'metro-4',
      name: 'Politechnika Metro Station',
      category: 'transport',
      type: 'Metro Station',
      description: 'M1 line station near Warsaw University of Technology',
      lat: 52.2198,
      lon: 21.0118,
      essential: true,
      address: 'Politechnika, Śródmieście'
    },
    {
      id: 'metro-5',
      name: 'Stadion Narodowy Metro',
      category: 'transport',
      type: 'Metro Station',
      description: 'M2 line station near National Stadium',
      lat: 52.2395,
      lon: 21.0458,
      essential: true,
      address: 'Praga Południe'
    },
    {
      id: 'hospital-1',
      name: 'Central Clinical Hospital',
      category: 'hospital',
      type: 'Hospital',
      description: 'Major public hospital with emergency services',
      lat: 52.2109,
      lon: 20.9825,
      essential: true,
      address: 'Banacha 1a, Ochota',
      phone: '+48 22 584 11 00'
    },
    {
      id: 'hospital-2',
      name: 'LuxMed Centrum',
      category: 'hospital',
      type: 'Hospital',
      description: 'Private medical center with international standards',
      lat: 52.2330,
      lon: 21.0067,
      essential: true,
      address: 'Żelazna 90, Wola',
      phone: '+48 22 33 00 100'
    },
    {
      id: 'hospital-3',
      name: 'Infant Jesus Hospital',
      category: 'hospital',
      type: 'Hospital',
      description: 'Historic hospital in city center',
      lat: 52.2419,
      lon: 21.0175,
      essential: true,
      address: 'Lindleya 4, Żoliborz',
      phone: '+48 22 502 11 00'
    },
    {
      id: 'pharmacy-1',
      name: 'Apteka Centrum 24h',
      category: 'hospital',
      type: 'Pharmacy',
      description: '24-hour pharmacy in city center',
      lat: 52.2297,
      lon: 21.0122,
      essential: true,
      address: 'Marszałkowska 104/122',
      phone: '+48 22 826 92 91'
    },
    {
      id: 'police-1',
      name: 'Śródmieście Police Station',
      category: 'police',
      type: 'Police Station',
      description: 'Main police station for city center',
      lat: 52.2370,
      lon: 21.0175,
      essential: true,
      address: 'Wilcza 21, Śródmieście',
      phone: '997'
    },
    {
      id: 'police-2',
      name: 'Tourist Police Warsaw',
      category: 'police',
      type: 'Police Station',
      description: 'Tourist police in Old Town area',
      lat: 52.2497,
      lon: 21.0122,
      essential: true,
      address: 'Stare Miasto',
      phone: '997'
    },
    {
      id: 'tourist-1',
      name: 'Royal Castle',
      category: 'tourist',
      type: 'Historical Site',
      description: 'Historic royal residence in Old Town',
      lat: 52.2480,
      lon: 21.0144,
      essential: true,
      address: 'Plac Zamkowy 4, Stare Miasto'
    },
    {
      id: 'tourist-2',
      name: 'Old Town Market Square',
      category: 'tourist',
      type: 'Historical Site',
      description: 'UNESCO World Heritage Site, heart of Old Town',
      lat: 52.2497,
      lon: 21.0122,
      essential: true,
      address: 'Rynek Starego Miasta'
    },
    {
      id: 'tourist-3',
      name: 'Palace of Culture and Science',
      category: 'tourist',
      type: 'Landmark',
      description: 'Iconic skyscraper with observation deck',
      lat: 52.2319,
      lon: 21.0061,
      essential: true,
      address: 'Plac Defilad 1'
    },
    {
      id: 'tourist-4',
      name: 'Łazienki Park',
      category: 'tourist',
      type: 'Park',
      description: 'Beautiful royal park with Palace on the Water',
      lat: 52.2154,
      lon: 21.0352,
      essential: true,
      address: 'Agrykoli 1, Śródmieście'
    }
  ];
}

export function getCategoryLocations(category) {
  return getOfflineLocations().filter(loc => loc.category === category);
}

export function getEssentialLocations() {
  return getOfflineLocations().filter(loc => loc.essential);
}
