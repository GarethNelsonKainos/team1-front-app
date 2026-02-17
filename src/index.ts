import 'dotenv/config';
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

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

const jobRoleService = new JobRoleService();

JobRoleController(app, jobRoleService);

app.use((req, res) => {
  res.status(404).render('404', {
    title: '404 - Page Not Found',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Frontend running on port ${PORT}`);
});

export default app;
