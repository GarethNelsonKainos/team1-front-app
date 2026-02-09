import express from 'express';
import nunjucks from 'nunjucks';
import dotenv from 'dotenv';
import { fetchJobRoles } from './api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure Nunjucks
nunjucks.configure('views', {
  autoescape: true,
  express: app
});

app.set('view engine', 'njk');

// Static files
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'Kainos Job Roles',
    message: 'Welcome to the Kainos Job Application System'
  });
});

app.get('/job-roles', async (req, res) => {
  try {
    const jobRoles = await fetchJobRoles();
    res.render('job-role-list', {
      title: 'Available Job Roles',
      jobRoles
    });
  } catch (error) {
    res.status(500).render('error', {
      title: 'Error',
      message: 'Unable to load job roles. Please try again later.'
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Frontend running on port ${PORT}`);
});

export default app;