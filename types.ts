
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

export interface UserProfile {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  employeeCode?: string;
  phone?: string;
  isOnline?: boolean;
  lastActive?: number;
  permissions?: {
    showSalesLog?: boolean;
    showInventoryLog?: boolean;
    showCompetitorReports?: boolean;
    showAllSales?: boolean;
  };
  vacationBalance?: {
    annual: number;
    casual: number;
    sick: number;
  };
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price?: number;
}

export interface Market {
  id: string;
  name: string;
  addedBy: string;
}

export interface Company {
  id: string;
  name: string;
  addedBy: string;
}

export interface SaleRecord {
  id: string;
  marketId: string;
  marketName: string;
  items: Array<{
    productName: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  date: string;
  timestamp: number;
  userId: string;
  username: string;
}

export interface InventoryRecord {
  id: string;
  marketId: string;
  marketName: string;
  items: Array<{
    productName: string;
    quantity: number;
  }>;
  date: string;
  timestamp: number;
  userId: string;
  username: string;
}

export interface CompetitorPriceRecord {
  id: string;
  marketId: string;
  marketName: string;
  companyId: string;
  companyName: string;
  items: Array<{
    category: string;
    productName: string;
    price: number;
  }>;
  date: string;
  timestamp: number;
  userId: string;
}

export interface VacationRequest {
  id: string;
  userId: string;
  username: string;
  date: string;
  days: number;
  type: 'annual' | 'casual' | 'sick' | 'exam';
  timestamp: number;
}

export interface AppSettings {
  tickerText: string;
  showDailySalesTicker: boolean;
  showMonthlySalesTicker: boolean;
  whatsappNumber: string;
  programName: string;
}

export interface NotificationMessage {
  id: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  isRead: boolean;
}
