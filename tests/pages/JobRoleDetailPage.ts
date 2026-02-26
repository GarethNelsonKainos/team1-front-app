import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class JobRoleDetailPage extends BasePage {
  private readonly heading: Locator;
  private readonly location: Locator;
  private readonly capability: Locator;
  private readonly band: Locator;
  private readonly closingDate: Locator;
  private readonly openPositions: Locator;
  private readonly applyButton: Locator;
  private readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.locator('h1');
    this.location = page
      .locator('label:has-text("Location")')
      .locator('..')
      .locator('div')
      .last();
    this.capability = page.locator('span.bg-gray-100').first();
    this.band = page.locator('span.bg-gray-100').nth(1);
    this.closingDate = page
      .locator('label:has-text("Closing Date")')
      .locator('..')
      .locator('div')
      .last();
    this.openPositions = page
      .locator('label:has-text("Open Positions")')
      .locator('..')
      .locator('div')
      .last();
    this.applyButton = page.locator('a:has-text("Apply Now")');
    this.errorMessage = page.locator('text=Unable to load');
  }

  async isHeadingVisible(): Promise<boolean> {
    return this.heading.isVisible();
  }

  async getLocation(): Promise<string> {
    return (await this.location.textContent()) || '';
  }

  async getCapability(): Promise<string> {
    return (await this.capability.textContent()) || '';
  }

  async getBand(): Promise<string> {
    return (await this.band.textContent()) || '';
  }

  async getClosingDate(): Promise<string> {
    return (await this.closingDate.textContent()) || '';
  }

  async getOpenPositions(): Promise<string> {
    return (await this.openPositions.textContent()) || '';
  }

  async isApplyButtonVisible(): Promise<boolean> {
    return this.applyButton.isVisible();
  }

  async isApplyButtonDisabled(): Promise<boolean> {
    return this.applyButton.isDisabled();
  }

  async clickApplyButton() {
    await this.applyButton.click();
  }

  async isErrorMessageVisible(): Promise<boolean> {
    return this.errorMessage.isVisible();
  }
}
