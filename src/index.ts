import 'dotenv/config';
import axios, { type AxiosError } from 'axios';
import express from 'express';
import nunjucks from 'nunjucks';
import JobRoleController from './controllers/JobRoleController';
import { JobRoleService } from './services/JobRoleService';

const app = express();
const PORT = process.env.PORT || 3000;

// Configure Nunjucks
nunjucks.configure('views', {
  autoescape: true,
  express: app,
});

app.set('view engine', 'njk');

// Static files
app.use(express.static('public'));

// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Kainos Job Roles',
    message: 'Welcome to the Kainos Job Application System',
  });
});

app.get('/login', (req, res) => {
  res.render('login', {
    title: 'Sign In - Kainos Job Roles',
  });
});

app.get('/application-success', (req, res) => {
  res.render('application-success', {
    title: 'Application Submitted - Kainos Job Roles',
  });
});

// Handle application submission - proxy to backend
app.post('/api/applications', async (req, res) => {
  try {
    const { jobRoleId } = req.body;
    const authToken = req.headers.authorization;

    if (!authToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

    // Forward the request to backend API
    const response = await axios.post(
      `${API_BASE_URL}/api/applications`,
      `jobRoleId=${jobRoleId}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: authToken,
        },
      },
    );

    // Redirect to success page for form submissions
    res.redirect('/application-success');
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error(
      'Error submitting application:',
      axiosError.response?.data || axiosError.message,
    );

    if (axiosError.response?.status === 401) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to submit application. Please try again later.',
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

const jobRoleService = new JobRoleService();

JobRoleController(app, jobRoleService);

// Start server
app.listen(PORT, () => {
  console.log(`Frontend running on port ${PORT}`);
});

export default app;
