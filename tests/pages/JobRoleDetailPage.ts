import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class JobRoleDetailPage extends BasePage {
  private readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.locator('h1');
  }

  async isHeadingVisible(): Promise<boolean> {
    return this.heading.isVisible();
  }
}
