export interface TopDeskConfig {
  id: string;
  user_id: string;
  enabled: boolean;
  api_url?: string;         // Decrypted value
  api_key?: string;         // Decrypted value
  encrypted_api_url?: string; // Encrypted value
  encrypted_api_key?: string; // Encrypted value
  key_id?: string;           // Encryption key identifier
  created_at: string;
  updated_at: string;
}

export interface TopDeskTicket {
  id: string;
  number: string;
  subject: string;
}

export interface TopDeskRatingData {
  ticketId?: string;
  ticketNumber?: string;
}