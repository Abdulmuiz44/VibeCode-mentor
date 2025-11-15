export const PRO_PRICE = 5;
export const PRO_CURRENCY = 'USD';
export const FREE_SAVE_LIMIT = 5;

export interface ProStatus {
  isPro: boolean;
  userId?: string;
  email?: string;
  expiresAt?: number;
}

export const getProStatus = (): ProStatus => {
  if (typeof window === 'undefined') {
    return { isPro: false };
  }
  
  const data = localStorage.getItem('pro-status');
  if (!data) {
    return { isPro: false };
  }
  
  try {
    const status: ProStatus = JSON.parse(data);
    // Check if expired
    if (status.expiresAt && status.expiresAt < Date.now()) {
      localStorage.removeItem('pro-status');
      return { isPro: false };
    }
    return status;
  } catch {
    return { isPro: false };
  }
};

export const setProStatus = (email: string, userId: string): void => {
  const status: ProStatus = {
    isPro: true,
    email,
    userId,
    // Set expiry to 31 days from now (monthly subscription)
    expiresAt: Date.now() + (31 * 24 * 60 * 60 * 1000),
  };
  localStorage.setItem('pro-status', JSON.stringify(status));
};

export const clearProStatus = (): void => {
  localStorage.removeItem('pro-status');
};

export const canSaveBlueprint = (currentSaveCount: number): boolean => {
  const { isPro } = getProStatus();
  if (isPro) return true;
  return currentSaveCount < FREE_SAVE_LIMIT;
};
