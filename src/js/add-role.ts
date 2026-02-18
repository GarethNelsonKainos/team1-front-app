import { JobRoleService } from '../services/JobRoleService';
import { requireAuth } from '../utils/auth.utils';
import {
  populateDropdown,
  populateLocationSelect,
} from '../utils/dropdown.utils';
import { showFormMessage } from '../utils/form.utils';
import {
  gatherJobRoleFormData,
  setupFormFieldValidation,
  validateJobRoleForm,
} from '../utils/job-role-form.utils';

const jobRoleService = new JobRoleService();

document.addEventListener('DOMContentLoaded', async () => {
  // TODO: Add authorization check here when auth module is ready
  // Check if user is Admin before allowing access to this page

  await loadDropdownData();
  setupFormFieldValidation();
  setupFormSubmission();
});

async function loadDropdownData(): Promise<void> {
  const token = requireAuth();
  if (!token) {
    window.location.href = '/login';
    return;
  }

  try {
    const [capabilities, bands, locations] = await Promise.all([
      jobRoleService.getCapabilities(token),
      jobRoleService.getBands(token),
      jobRoleService.getLocations(token),
    ]);

    populateDropdown(
      'capability',
      capabilities,
      'capabilityId',
      'capabilityName',
    );
    populateDropdown('band', bands, 'bandId', 'bandName');
    populateLocationSelect('location', locations);
  } catch (error) {
    console.error('Error loading dropdown data:', error);
    showFormMessage(
      'Failed to load form data. Please refresh the page.',
      'error',
    );
  }
}

function setupFormSubmission(): void {
  const form = document.getElementById('addJobRoleForm') as HTMLFormElement;

  form.addEventListener('submit', async (e: Event) => {
    e.preventDefault();

    if (!validateJobRoleForm()) {
      showFormMessage(
        'Please fix all validation errors before submitting.',
        'error',
      );
      return;
    }

    const formData = gatherJobRoleFormData();

    try {
      const token = requireAuth();
      if (!token) {
        window.location.href = '/login';
        return;
      }

      await jobRoleService.createJobRole(formData, token);

      showFormMessage(
        'Job role created successfully! Redirecting...',
        'success',
      );
      setTimeout(() => {
        window.location.href = '/job-roles';
      }, 2000);
    } catch (error) {
      console.error('Error submitting form:', error);
      showFormMessage('Failed to create job role. Please try again.', 'error');
    }
  });
}
