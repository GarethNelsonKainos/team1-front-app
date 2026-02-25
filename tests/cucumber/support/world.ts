import { World, setWorldConstructor } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';
import type { Browser, BrowserContext, Page } from '@playwright/test';

export class PlaywrightWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
}

setWorldConstructor(PlaywrightWorld);