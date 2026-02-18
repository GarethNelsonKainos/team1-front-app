import type { JWTPayload } from '../models/auth.types.ts';

document.addEventListener('DOMContentLoaded', () => {
  // TODO: Replace with proper auth check when auth module is ready
  // For now, check if user token exists and has admin role
  const token = sessionStorage.getItem('authToken');

  if (token) {
    try {
      // Decode JWT token to check user role
      const base64Payload = token.split('.')[1];
      const decodedPayload = atob(base64Payload);
      const payload: JWTPayload = JSON.parse(decodedPayload);

      // UserRole.Admin = 2 (from backend auth.types.ts)
      if (payload.userRole === 2) {
        const adminActions = document.getElementById('adminActions');
        if (adminActions) {
          adminActions.classList.remove('hidden');
        }
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  }
});
