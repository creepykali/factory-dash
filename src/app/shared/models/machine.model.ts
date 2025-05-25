export interface Machine {
  id: string;
  name: string;
  status: string;
  metrics?: {
    performance: number;
    producedParts: number;
  };
  errors?: string[];
}
