import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AddRolePage extends BasePage {
  private readonly roleNameInput: Locator;
  private readonly capabilitySelect: Locator;
  private readonly bandSelect: Locator;
  private readonly descriptionInput: Locator;
  private readonly jobSpecLinkInput: Locator;
  private readonly responsibilitiesInput: Locator;
  private readonly openPositionsInput: Locator;
  private readonly locationSelect: Locator;
  private readonly closingDateInput: Locator;
  private readonly submitButton: Locator;
  private readonly descriptionError: Locator;

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

  async isRoleNameValueMissing(): Promise<boolean> {
    return this.roleNameInput.evaluate(
      (el: HTMLInputElement) => el.validity.valueMissing,
    );
  }

  async isRoleNameTooShort(): Promise<boolean> {
    return this.roleNameInput.evaluate(
      (el: HTMLInputElement) => el.validity.tooShort,
    );
  }

  async clearCapabilitySelection() {
    await this.capabilitySelect.selectOption('');
  }

  async isCapabilityValueMissing(): Promise<boolean> {
    return this.capabilitySelect.evaluate(
      (el: HTMLSelectElement) => el.validity.valueMissing,
    );
  }

  async clearBandSelection() {
    await this.bandSelect.selectOption('');
  }

  async isBandValueMissing(): Promise<boolean> {
    return this.bandSelect.evaluate(
      (el: HTMLSelectElement) => el.validity.valueMissing,
    );
  }

  async isDescriptionErrorVisible(): Promise<boolean> {
    return this.descriptionError.isVisible();
  }

  async getDescriptionErrorText(): Promise<string> {
    return this.descriptionError.innerText();
  }

  async isRoleNameErrorVisible(): Promise<boolean> {
    const errorLocator = this.page.locator(
      '[data-testid="role-name-error"], .error-message:near(#role-name)',
    );
    return await errorLocator.isVisible();
  }

  async isCapabilityErrorVisible(): Promise<boolean> {
    const errorLocator = this.page.locator(
      '[data-testid="capability-error"], .error-message:near(#capability)',
    );
    return await errorLocator.isVisible();
  }

  async isBandErrorVisible(): Promise<boolean> {
    const errorLocator = this.page.locator(
      '[data-testid="band-error"], .error-message:near(#band)',
    );
    return await errorLocator.isVisible();
  }

  async isJobSpecLinkErrorVisible(): Promise<boolean> {
    const errorLocator = this.page.locator(
      '[data-testid="job-spec-link-error"], .error-message:near(#job-spec-link)',
    );
    return await errorLocator.isVisible();
  }

  async isResponsibilitiesErrorVisible(): Promise<boolean> {
    const errorLocator = this.page.locator(
      '[data-testid="responsibilities-error"], .error-message:near(#responsibilities)',
    );
    return await errorLocator.isVisible();
  }

  async isLocationErrorVisible(): Promise<boolean> {
    const errorLocator = this.page.locator(
      '[data-testid="location-error"], .error-message:near(#location)',
    );
    return await errorLocator.isVisible();
  }

  async isClosingDateErrorVisible(): Promise<boolean> {
    const errorLocator = this.page.locator(
      '[data-testid="closing-date-error"], .error-message:near(#closing-date)',
    );
    return await errorLocator.isVisible();
  }

  async getRoleNameErrorText(): Promise<string> {
    const errorLocator = this.page.locator(
      '[data-testid="role-name-error"], .error-message:near(#role-name)',
    );
    return (await errorLocator.textContent()) || '';
  }

  async getClosingDateErrorText(): Promise<string> {
    const errorLocator = this.page.locator(
      '[data-testid="closing-date-error"], .error-message:near(#closing-date)',
    );
    return (await errorLocator.textContent()) || '';
  }

  async selectMultipleLocations() {
    await this.page.locator('[data-testid="location-select"]').first().click();
    await this.page.locator('[data-testid="location-option"]').first().click();

    await this.page.locator('[data-testid="location-select"]').click();
    await this.page.locator('[data-testid="location-option"]').nth(1).click();
  }
}
