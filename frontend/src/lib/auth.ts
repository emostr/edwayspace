'use client';

import { decodeJwt } from 'jose';

export interface TokenPayload {
  sub: string;
  role: string;
  schoolId: string;
  classId: string | null;
  exp: number;
}

export interface UserProfile {
  id: string;
  login: string;
  firstName: string;
  lastName: string;
  role: string;
  schoolId: string;
  classId: string | null;
}

export function saveToken(token: string): void {
  localStorage.setItem('token', token);
  document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function removeToken(): void {
  localStorage.removeItem('token');
  document.cookie = 'token=; path=/; max-age=0';
}

export function saveUserProfile(profile: UserProfile): void {
  localStorage.setItem('userProfile', JSON.stringify(profile));
}

export function getUserProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('userProfile');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function removeUserProfile(): void {
  localStorage.removeItem('userProfile');
}

export function getTokenPayload(): TokenPayload | null {
  const token = getToken();
  if (!token) return null;
  try {
    return decodeJwt(token) as TokenPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(): boolean {
  const payload = getTokenPayload();
  if (!payload) return true;
  return Date.now() / 1000 > payload.exp;
}
