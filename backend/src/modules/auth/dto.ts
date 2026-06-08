export type Role = 'ADMIN' | 'JUDGE' | 'PUBLIC';

export interface RegisterDTO {
  username: string;
  password?: string;
  name: string;
  role?: Role;
  isChairman?: boolean;
}

export interface LoginDTO {
  username: string;
  password?: string;
}

export function validateRegister(body: any): string | null {
  if (!body.username || typeof body.username !== 'string' || body.username.trim().length < 3) {
    return 'Username must be at least 3 characters long';
  }
  if (!body.password || typeof body.password !== 'string' || body.password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    return 'Name is required';
  }
  return null;
}

export function validateLogin(body: any): string | null {
  if (!body.username || typeof body.username !== 'string') {
    return 'Username is required';
  }
  if (!body.password || typeof body.password !== 'string') {
    return 'Password is required';
  }
  return null;
}
