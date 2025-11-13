const MAPBOX = import.meta.env.VITE_MAPBOX_TOKEN;

if (!MAPBOX) {
  console.warn('VITE_MAPBOX_TOKEN is not set. Map features will not work. Please add it to your environment variables.');
}

export const staticMapUrl = (lat: number, lng: number) => 
  `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-l+000(${lng},${lat})/${lng},${lat},14/320x180@2x?access_token=${MAPBOX}`;

export const leafletTileUrl = 
  `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{y}/{x}?access_token=${MAPBOX}`;

export const geocodeUrl = (q: string) => 
  `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?autocomplete=true&types=neighborhood,place,postcode&limit=5&access_token=${MAPBOX}`;
