export enum OrderStatus {
  PENDING = "PENDING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}
export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
  EDITOR = "EDITOR",
}

export enum Status {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING = "PENDING",
  DELETED = "DELETED",
}

export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: Role;
  status: Status;
  avatarUrl?: string;
  bio?: string;
  dateOfBirth?: Date;
  phoneNumber?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Product {
  id: number;
  userId?: number;
  name: string;
  description: string;
  price: number;
  brand?: string;
  images?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Category {
  id: number;
  name: string;
  parentId?: number;
}


export interface Order {
  id: number;
  buyerId: number;
  sellerId: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

