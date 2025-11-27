
export interface Location {
  lat: number;
  lng: number;
}

export interface SquadMember {
  id: string;
  name: string;
  interest: string; // Specific interest for this person
}

export interface Activity {
  id: string;
  name: string;
  description: string; // Short summary
  fullDescription?: string; // Detailed description for expanded view
  matchReason: string; // Why AI chose this
  vibeScore: number; // 1-100 match percentage
  category: 'Food' | 'Nightlife' | 'Activity' | 'Culture' | 'Outdoors';
  priceRange: 'Low' | 'Medium' | 'High';
  pricePerPerson: string; // e.g. "15-20€"
  coordinates: {
    lat: number;
    lng: number;
  };
  address?: string;
  distance?: string; // e.g. "1.2 km"
  distanceValue?: number; // Raw distance in km for sorting
  imagePrompt?: string; // Visual description for AI generation
  isUserGenerated?: boolean; // Flag for events added by users
}

export interface UserPreferences {
  squad: SquadMember[];
  budget: 'Cheap' | 'Moderate' | 'Expensive';
  duration: 'Couple hours' | 'Half day' | 'Full day';
  locationName: string; 
  userCoordinates?: { lat: number, lng: number }; // For distance calc
  excludedCategories: string[]; // List of things to avoid
}

export enum AppState {
  IDLE,
  SEARCHING,
  RESULTS,
  ERROR
}
