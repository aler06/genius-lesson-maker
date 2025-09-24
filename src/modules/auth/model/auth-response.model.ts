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
    tokenType: string;
    expiresIn: number;
  }