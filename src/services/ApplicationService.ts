import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

export default class ApplicationService {
  async createApplication(
    jobRoleId: number,
    cvFile: Express.Multer.File,
  ): Promise<void> {
    const fileBlob = new Blob([new Uint8Array(cvFile.buffer)], {
      type: cvFile.mimetype,
    });

    const formData = new FormData();
    formData.append('cv', fileBlob, cvFile.originalname);
    formData.append('jobRoleId', jobRoleId.toString());

    await axios.post(`${API_BASE_URL}/api/applications`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}
