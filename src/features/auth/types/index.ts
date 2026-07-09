export type User = {
  _id: string;
  email: string;
  role: string;
  status: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
};
