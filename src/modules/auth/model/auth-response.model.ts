export interface LoginResponse {
    accessToken: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      isActive: boolean;
    };
    tokenType?: string;
    expiresIn?: number;
  }

export interface LoginRequestDto {
    email: string;
    password: string;
  }

export interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isActive: boolean;
  }

export interface RefreshTokenResponse {
    accessToken: string;
    expiresIn: number;
  }

export interface ValidateTokenResponse {
    valid: boolean;
    user: {
      sub: string;
      email: string;
      role: string;
      firstName: string;
      lastName: string;
    };
  }