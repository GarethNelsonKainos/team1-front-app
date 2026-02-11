import dotenv from 'dotenv';
import express from 'express';
import nunjucks from 'nunjucks';
import JobRoleController from './controllers/JobRoleController';
import { JobRoleService } from './services/JobRoleService';

dotenv.config();

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

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Frontend running on port ${PORT}`);
});

const jobRoleService = new JobRoleService();

JobRoleController(app, jobRoleService);

export default app;
