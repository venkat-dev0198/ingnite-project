
export interface Contact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export interface AlertLog {
  id: string;
  timestamp: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  type: 'SOS' | 'Voice' | 'Manual' | 'Check-In' | 'Geo-Fence';
  recordingUrl?: string;
}

export interface NearbyPlace {
  name: string;
  address: string;
  distance?: string;
  phone?: string;
  type: 'Police' | 'Hospital' | 'Helpline';
  uri?: string;
}

export enum AppTab {
  HOME = 'home',
  CONTACTS = 'contacts',
  NEARBY = 'nearby',
  HISTORY = 'history',
  DOCS = 'docs'
}

export interface SafetySettings {
  silentAlarm: boolean;
  autoRecording: boolean;
  threatDetection: boolean;
  geoFenceEnabled: boolean;
  safeRadius: number; // in meters
}
