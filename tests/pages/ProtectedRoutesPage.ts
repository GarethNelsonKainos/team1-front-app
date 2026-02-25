import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProtectedRoutesPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async gotoJobRoles() {
    await this.page.goto('/job-roles');
  }

  async gotoAddRole() {
    await this.page.goto('/add-role');
  }

  async expectRedirectedToLogin() {
    await expect(this.page).toHaveURL('/login');
  }
}