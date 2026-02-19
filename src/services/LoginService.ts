import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

export class LoginService {
  async login(email: string, password: string): Promise<string> {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email,
      password,
    });
    return response.data.token;
  }
}
