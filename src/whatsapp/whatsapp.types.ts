export type WhatsAppSessionStatus =
  | "connecting"
  | "qr"
  | "open"
  | "close"
  | "error";

export interface WhatsAppSession {
  userId: number;
  status: WhatsAppSessionStatus;
  qrCode?: string;
  phoneNumber?: string;
  connectedAt?: Date;
  lastError?: string;
}