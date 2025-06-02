// API URL configuration
export const API_URL = 'https://test-project-chi-tan.vercel.app/api';

// Map configuration
export const MAP_CONFIG = {
  defaultCenter: [40.7128, -74.0060], // New York City
  defaultZoom: 12,
  tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
};

// Connector types
export const CONNECTOR_TYPES = [
  'Type 1 (J1772)',
  'Type 2 (Mennekes)',
  'CCS1',
  'CCS2',
  'CHAdeMO',
  'Tesla',
  'GB/T',
  'Other'
];

// Station status options
export const STATION_STATUS = [
  { value: 'active', label: 'Active', color: 'bg-secondary-500' },
  { value: 'inactive', label: 'Inactive', color: 'bg-danger-500' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-neutral-500' }
];