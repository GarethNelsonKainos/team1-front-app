import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AddRolePage extends BasePage {
  readonly roleNameInput: Locator;
  readonly capabilitySelect: Locator;
  readonly bandSelect: Locator;
  readonly descriptionInput: Locator;
  readonly jobSpecLinkInput: Locator;
  readonly responsibilitiesInput: Locator;
  readonly openPositionsInput: Locator;
  readonly locationSelect: Locator;
  readonly closingDateInput: Locator;
  readonly submitButton: Locator;
  readonly descriptionError: Locator;

  static readonly VALID_FORM_DEFAULTS: Record<string, string> = {
    roleName: 'E2E Test Role',
    capability: 'Engineering',
    band: 'Associate',
    description: 'This is an e2e test role created by Playwright automation.',
    jobSpecLink:
      'https://kainossoftwareltd.sharepoint.com/sites/Career/JobProfiles/Engineering/Job%20profile%20-%20Senior%20Software%20Engieneer%20(Senior%20Associate).pdf',
    responsibilities:
      'Write automated tests, maintain the test framework, report bugs.',
    openPositions: '2',
    location: 'Remote',
  };

  constructor(page: Page) {
    super(page);
    this.roleNameInput = page.locator('#roleName');
    this.capabilitySelect = page.locator('#capability');
    this.bandSelect = page.locator('#band');
    this.descriptionInput = page.locator('#description');
    this.jobSpecLinkInput = page.locator('#jobSpecLink');
    this.responsibilitiesInput = page.locator('#responsibilities');
    this.openPositionsInput = page.locator('#openPositions');
    this.locationSelect = page.locator('#location');
    this.closingDateInput = page.locator('#closingDate');
    this.submitButton = page.getByRole('button', { name: 'Add Job Role' });
    this.descriptionError = page.locator('#descriptionError');
  }

  async goto() {
    await this.page.goto('/add-role');
  }

  async getUrl(): Promise<string> {
    return this.page.url();
  }

  async fillValidForm(overrides: Record<string, string> = {}) {
    const values = { ...AddRolePage.VALID_FORM_DEFAULTS, ...overrides };

    await this.roleNameInput.fill(values.roleName);
    await this.capabilitySelect.selectOption({ label: values.capability });
    await this.bandSelect.selectOption({ label: values.band });
    await this.descriptionInput.fill(values.description);
    await this.jobSpecLinkInput.fill(values.jobSpecLink);
    await this.responsibilitiesInput.fill(values.responsibilities);
    await this.openPositionsInput.fill(values.openPositions);
    await this.locationSelect.selectOption({ label: values.location });

    const closingDate = new Date();
    closingDate.setFullYear(closingDate.getFullYear() + 1);
    await this.closingDateInput.fill(closingDate.toISOString().split('T')[0]);
  }

  async submit() {
    await this.submitButton.click();
  }
}
