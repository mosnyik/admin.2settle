import { RowDataPacket } from "mysql2/promise";

export interface Subscription {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface Notification {
  id: number;
  title: string;
  body: string;
  is_read: number;
  created_at: string;
}

export interface NotificationRow extends RowDataPacket {
  id: number;
  title: string;
  body: string;
  is_read: number;
  created_at: string;
}
