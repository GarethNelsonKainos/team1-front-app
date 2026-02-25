import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class JobRolesListPage extends BasePage {
  private readonly heading: Locator;
  private readonly jobRoleCards: Locator;
  private readonly addNewRoleButton: Locator;
  private readonly noRolesMessage: Locator;

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

  async isFirstJobRoleCardVisible(): Promise<boolean> {
    return this.jobRoleCards.first().isVisible();
  }

  async isAddNewRoleButtonVisible(): Promise<boolean> {
    return this.addNewRoleButton.isVisible();
  }

  async clickFirstRole() {
    await this.jobRoleCards.first().click();
  }
}
