import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class JobRolesListPage extends BasePage {
  readonly heading: Locator;
  readonly jobRoleCards: Locator;
  readonly addNewRoleButton: Locator;
  readonly noRolesMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Current vacancies' });
    this.jobRoleCards = page.locator('a[href^="/job-roles/"]');
    this.addNewRoleButton = page.locator('a[href="/add-role"]');
    this.noRolesMessage = page.getByText(
      'No job roles available at this time.',
    );
  }

  async goto() {
    await this.page.goto('/job-roles');
  }

  async getUrl(): Promise<string> {
    return this.page.url();
  }

  async getHeadingState(): Promise<boolean> {
    return this.heading.isVisible();
  }

  async clickFirstRole() {
    await this.jobRoleCards.first().click();
  }
}
