   export type UserFormValues = {
    name: string;
    email: string;
    bonusBalance: number;
    phone?: string;
    role: 'USER' | 'ADMIN' | 'SUPERADMIN';
    isVerified: boolean;
  };