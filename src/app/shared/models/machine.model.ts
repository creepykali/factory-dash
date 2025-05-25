// Example shape—match the API’s JSON schema
export interface Machine {
  id: string;
  name: string;
  status: 'Running' | 'Stopped' | 'Error' | 'Idle';
  metrics: {
    performance: number;      // e.g. percentage
    producedParts: number;    // number
    [key: string]: any;       // any extra fields from the API
  };
  errors: string[];          // active error messages
  // ... any other fields (location, lastMaintenance, etc.)
}
