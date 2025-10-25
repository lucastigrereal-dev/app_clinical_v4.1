/**
 * TypeScript interfaces matching the OpenAPI specification
 */

export interface Patient {
  id: number;
  name: string;
  clinicId: number;
}

export interface TimelineItem {
  id: number;
  date: string;
  title: string;
  description: string;
  phase: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface CreatePatientRequest {
  name: string;
  clinicId: number;
}

export interface PhotoUploadResponse {
  id: number;
  url: string;
  uploadedAt: string;
}