export type PlaceSuggestion = {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  lat?: number;
  lng?: number;
};

export type GeocodeResult = {
  formattedAddress: string;
  lat: number;
  lng: number;
  suburb?: string;
  postcode?: string;
  placeId?: string;
};
