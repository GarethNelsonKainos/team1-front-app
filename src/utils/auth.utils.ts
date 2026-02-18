export function getAuthToken(): string | null {
  return sessionStorage.getItem('authToken');
}

export function requireAuth(): string {
  const token = getAuthToken();
  if (!token) {
    window.location.href = '/login';
    throw new Error('No auth token');
  }
  return token;
}
