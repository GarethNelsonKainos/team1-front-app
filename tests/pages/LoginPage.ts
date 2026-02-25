import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;
  private readonly signInHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.bg-red-100');
    this.signInHeading = page.getByRole('heading', { name: 'Sign In' });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async enterEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async enterPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async clickLogin() {
    await this.loginButton.click();
  }

  // Convenience method combining the three steps above
  async login(email: string, password: string) {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickLogin();
  }

  async getErrorMessage(): Promise<string> {
    await this.errorMessage.waitFor({ state: 'visible' });
    return this.errorMessage.innerText();
  }

  async isEmailInputVisible(): Promise<boolean> {
    return this.emailInput.isVisible();
  }

  async isPasswordInputVisible(): Promise<boolean> {
    return this.passwordInput.isVisible();
  }

  async isLoginButtonVisible(): Promise<boolean> {
    return this.loginButton.isVisible();
  }

  async isSignInHeadingVisible(): Promise<boolean> {
    return this.signInHeading.isVisible();
  }

  async getUrl(): Promise<string> {
    return this.page.url();
  }
}
