import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class JobRoleDetailPage extends BasePage {
  private readonly heading: Locator;
  private readonly backToJobRolesButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.locator('h1');
    this.backToJobRolesButton = page.locator('a:has-text("Back to Job Roles")');
  }

  async isHeadingVisible(): Promise<boolean> {
    return this.heading.isVisible();
  }

  async clickBackToJobRoles(): Promise<void> {
    await this.backToJobRolesButton.click();
  }

  async getUrl(): Promise<string> {
    return this.page.url();
  }
}
