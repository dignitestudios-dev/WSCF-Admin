export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'superadmin';
};

export type AuthResponse = {
  user: User;
  token: string;
};
