import type { CreateJobRoleRequest } from '../models/CreateJobRoleRequest';
import { clearValidationErrors, showFieldError } from './form.utils';
import { createJobRoleSchema } from './job-role.validators';

const FIELD_CONFIG = {
  roleName: { fieldId: 'roleName', errorId: 'roleNameError' },
  capability: { fieldId: 'capability', errorId: 'capabilityError' },
  band: { fieldId: 'band', errorId: 'bandError' },
  jobSpecSummary: { fieldId: 'jobSpecSummary', errorId: 'jobSpecSummaryError' },
  responsibilities: {
    fieldId: 'responsibilities',
    errorId: 'responsibilitiesError',
  },
  jobSpecLink: { fieldId: 'jobSpecLink', errorId: 'jobSpecLinkError' },
  openPositions: { fieldId: 'openPositions', errorId: 'openPositionsError' },
  location: { fieldId: 'location', errorId: 'locationError' },
  closingDate: { fieldId: 'closingDate', errorId: 'closingDateError' },
} as const;

export function gatherJobRoleFormData(): CreateJobRoleRequest {
  const locationSelect = document.getElementById(
    'location',
  ) as HTMLSelectElement;
  const locationIds = Array.from(locationSelect.selectedOptions).map((opt) =>
    Number.parseInt(opt.value),
  );

  return {
    roleName: (
      document.getElementById('roleName') as HTMLInputElement
    ).value.trim(),
    capabilityId: Number.parseInt(
      (document.getElementById('capability') as HTMLSelectElement).value,
    ),
    bandId: Number.parseInt(
      (document.getElementById('band') as HTMLSelectElement).value,
    ),
    description: (
      document.getElementById('jobSpecSummary') as HTMLTextAreaElement
    ).value.trim(),
    responsibilities: (
      document.getElementById('responsibilities') as HTMLTextAreaElement
    ).value.trim(),
    jobSpecLink: (
      document.getElementById('jobSpecLink') as HTMLInputElement
    ).value.trim(),
    openPositions: Number.parseInt(
      (document.getElementById('openPositions') as HTMLInputElement).value,
    ),
    locationIds,
    closingDate: new Date(
      (document.getElementById('closingDate') as HTMLInputElement).value,
    ).toISOString(),
  };
}

export function setupFormFieldValidation(): void {
  for (const fieldId of Object.values(FIELD_CONFIG).map((c) => c.fieldId)) {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('blur', () => validateJobRoleForm());
    }
  }
}

export function validateJobRoleForm(): boolean {
  clearValidationErrors();
  const formData = gatherJobRoleFormData();
  const result = createJobRoleSchema.safeParse(formData);

  if (!result.success) {
    const errorMap: Record<string, { errorId: string; fieldId: string }> = {
      roleName: FIELD_CONFIG.roleName,
      capabilityId: FIELD_CONFIG.capability,
      bandId: FIELD_CONFIG.band,
      description: FIELD_CONFIG.jobSpecSummary,
      responsibilities: FIELD_CONFIG.responsibilities,
      jobSpecLink: FIELD_CONFIG.jobSpecLink,
      openPositions: FIELD_CONFIG.openPositions,
      locationIds: FIELD_CONFIG.location,
      closingDate: FIELD_CONFIG.closingDate,
    };

    const errors = result.error.flatten().fieldErrors;
    for (const [field, messages] of Object.entries(errors)) {
      const mapping = errorMap[field];
      if (mapping && messages && messages.length > 0) {
        showFieldError(mapping.fieldId, mapping.errorId, messages[0]);
      }
    }
    return false;
  }
  return true;
}
