export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

export const setAccessToken = (accessToken: string): void => {
  localStorage.setItem('accessToken', accessToken);
};

export const clearToken = (): void => {
  localStorage.removeItem('accessToken');
};

export const getSerchHistory = () : string | null => {
  return localStorage.getItem('chhat_search_history');
};

export const setSearchHistory = (serchTerm: string[]): void => {
  localStorage.setItem('chhat_search_history', JSON.stringify(serchTerm));
};
