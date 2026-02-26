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
  private readonly cancelLink: Locator;

  // Error message locators
  private readonly roleNameError: Locator;
  private readonly capabilityError: Locator;
  private readonly bandError: Locator;
  private readonly descriptionError: Locator;
  private readonly responsibilitiesError: Locator;
  private readonly jobSpecLinkError: Locator;
  private readonly openPositionsError: Locator;
  private readonly locationError: Locator;
  private readonly closingDateError: Locator;

  // Character counter locators
  private readonly descriptionCharCount: Locator;
  private readonly responsibilitiesCharCount: Locator;

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
    this.cancelLink = page.getByRole('link', { name: 'Cancel' });

    // Error locators
    this.roleNameError = page.locator('#roleNameError');
    this.capabilityError = page.locator('#capabilityError');
    this.bandError = page.locator('#bandError');
    this.descriptionError = page.locator('#descriptionError');
    this.responsibilitiesError = page.locator('#responsibilitiesError');
    this.jobSpecLinkError = page.locator('#jobSpecLinkError');
    this.openPositionsError = page.locator('#openPositionsError');
    this.locationError = page.locator('#locationError');
    this.closingDateError = page.locator('#closingDateError');

    // Character counters
    this.descriptionCharCount = page.locator('#summaryCount');
    this.responsibilitiesCharCount = page.locator('#responsibilitiesCount');
  }

  async goto() {
    await this.page.goto('/add-role');
  }

  async getUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Selects an option from a dropdown, either by label or selects the first non-empty option
   * @param select - The select element locator
   * @param value - Optional specific value/label to select
   */
  private async selectDropdownOption(select: Locator, value?: string) {
    if (value !== undefined && value !== '') {
      await select.selectOption({ label: value });
    } else {
      const firstOption = await select
        .locator('option:not([value=""])')
        .first()
        .getAttribute('value');
      if (firstOption) {
        await select.selectOption(firstOption);
      }
    }
  }

  async fillRoleName(value: string) {
    await this.roleNameInput.clear();
    await this.roleNameInput.fill(value);
  }

  async fillDescription(value: string) {
    await this.descriptionInput.clear();
    await this.descriptionInput.fill(value);
  }

  async fillResponsibilities(value: string) {
    await this.responsibilitiesInput.clear();
    await this.responsibilitiesInput.fill(value);
  }

  async fillJobSpecLink(value: string) {
    await this.jobSpecLinkInput.clear();
    await this.jobSpecLinkInput.fill(value);
  }

  async fillValidForm(overrides: Record<string, string> = {}) {
    const defaults: Record<string, string> = {
      roleName: `E2E Test Role ${Date.now()}`,
      description: 'This is an e2e test role created by Playwright automation.',
      jobSpecLink:
        'https://kainossoftwareltd.sharepoint.com/sites/Career/JobProfiles/Engineering/Job%20profile.pdf',
      responsibilities:
        'Write automated tests, maintain the test framework, report bugs.',
      openPositions: '2',
    };

    const values = { ...defaults, ...overrides };

    // Role Name
    if (values.roleName !== undefined) {
      await this.fillRoleName(values.roleName);
    }

    // Capability - using reusable method
    if (values.capability === undefined || values.capability !== '') {
      await this.selectDropdownOption(this.capabilitySelect, values.capability);
    }

    // Band - using reusable method
    if (values.band === undefined || values.band !== '') {
      await this.selectDropdownOption(this.bandSelect, values.band);
    }

    // Description
    if (values.description !== undefined) {
      await this.fillDescription(values.description);
    }

    // Job Spec Link
    if (values.jobSpecLink !== undefined) {
      await this.fillJobSpecLink(values.jobSpecLink);
    }

    // Responsibilities
    if (values.responsibilities !== undefined) {
      await this.fillResponsibilities(values.responsibilities);
    }

    // Open Positions
    if (values.openPositions !== undefined) {
      await this.openPositionsInput.fill(values.openPositions);
    }

    // Location - using reusable method
    if (values.location === undefined || values.location !== '') {
      await this.selectDropdownOption(this.locationSelect, values.location);
    }

    // Closing Date - set to 1 year from now if not specified
    if (values.closingDate !== undefined && values.closingDate !== '') {
      await this.closingDateInput.fill(values.closingDate);
    } else if (values.closingDate === undefined) {
      const closingDate = new Date();
      closingDate.setFullYear(closingDate.getFullYear() + 1);
      await this.closingDateInput.fill(closingDate.toISOString().split('T')[0]);
    }
  }

  async submit() {
    await this.submitButton.click();
  }

  async cancel() {
    await this.cancelLink.click();
  }

  // Selection clearing
  async clearCapabilitySelection() {
    await this.capabilitySelect.selectOption('');
  }

  async clearBandSelection() {
    await this.bandSelect.selectOption('');
  }

  async clearLocationSelection() {
    await this.page.evaluate(() => {
      const select = document.getElementById('location') as HTMLSelectElement;
      if (select) {
        for (let i = 0; i < select.options.length; i++) {
          select.options[i].selected = false;
        }
      }
    });
  }

  async selectMultipleLocations() {
    const options = await this.locationSelect.locator('option').count();
    if (options >= 2) {
      const firstValue = await this.locationSelect
        .locator('option')
        .nth(0)
        .getAttribute('value');
      const secondValue = await this.locationSelect
        .locator('option')
        .nth(1)
        .getAttribute('value');
      if (firstValue && secondValue) {
        await this.locationSelect.selectOption([firstValue, secondValue]);
      }
    }
  }

  // JS validation error visibility checks
  async isRoleNameErrorVisible(): Promise<boolean> {
    return this.roleNameError.isVisible().catch(() => false);
  }

  async getRoleNameErrorText(): Promise<string> {
    return this.roleNameError.innerText();
  }

  async isCapabilityErrorVisible(): Promise<boolean> {
    return this.capabilityError.isVisible().catch(() => false);
  }

  async getCapabilityErrorText(): Promise<string> {
    return this.capabilityError.innerText();
  }

  async isBandErrorVisible(): Promise<boolean> {
    return this.bandError.isVisible().catch(() => false);
  }

  async getBandErrorText(): Promise<string> {
    return this.bandError.innerText();
  }

  async isDescriptionErrorVisible(): Promise<boolean> {
    return this.descriptionError.isVisible().catch(() => false);
  }

  async getDescriptionErrorText(): Promise<string> {
    return this.descriptionError.innerText();
  }

  async isResponsibilitiesErrorVisible(): Promise<boolean> {
    return this.responsibilitiesError.isVisible().catch(() => false);
  }

  async getResponsibilitiesErrorText(): Promise<string> {
    return this.responsibilitiesError.innerText();
  }

  async isJobSpecLinkErrorVisible(): Promise<boolean> {
    return this.jobSpecLinkError.isVisible().catch(() => false);
  }

  async getJobSpecLinkErrorText(): Promise<string> {
    return this.jobSpecLinkError.innerText();
  }

  async isOpenPositionsErrorVisible(): Promise<boolean> {
    return this.openPositionsError.isVisible().catch(() => false);
  }

  async getOpenPositionsErrorText(): Promise<string> {
    return this.openPositionsError.innerText();
  }

  async isLocationErrorVisible(): Promise<boolean> {
    return this.locationError.isVisible().catch(() => false);
  }

  async getLocationErrorText(): Promise<string> {
    return this.locationError.innerText();
  }

  async isClosingDateErrorVisible(): Promise<boolean> {
    return this.closingDateError.isVisible().catch(() => false);
  }

  async getClosingDateErrorText(): Promise<string> {
    return this.closingDateError.innerText();
  }

  // Character counter getters
  async getDescriptionCharCount(): Promise<string> {
    return this.descriptionCharCount.innerText();
  }

  async getResponsibilitiesCharCount(): Promise<string> {
    return this.responsibilitiesCharCount.innerText();
  }
}
