import 'dotenv/config';
import cookieParser from 'cookie-parser';
import express from 'express';
import nunjucks from 'nunjucks';
import authenticateRouter from './Router/AuthenticateRouter';
import JobRoleController from './controllers/JobRoleController';
import { JobRoleService } from './services/JobRoleService';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configure Nunjucks
nunjucks.configure('views', {
  autoescape: true,
  express: app,
});

app.set('view engine', 'njk');

// Static files
app.use(express.static('public'));

// Auth routes
authenticateRouter(app);

// Routes
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Kainos Job Roles',
    message: 'Welcome to the Kainos Job Application System',
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

// Start server
app.listen(PORT, () => {
  console.log(`Frontend running on port ${PORT}`);
});

export default app;
