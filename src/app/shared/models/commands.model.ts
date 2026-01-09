export interface CommandResponse {
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'ERROR';
  results?: any[];
  error?: string;
  detail?: string;
}
