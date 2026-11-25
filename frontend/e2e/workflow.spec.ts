import { test, expect } from '@playwright/test';

test('project and task persist from the browser through PostgreSQL', async ({ page }) => {
  const suffix = Date.now().toString();
  const email = `browser-${suffix}@example.test`;
  const project = 'Browser project ' + suffix;
  const task = 'Browser task ' + suffix;

  await page.goto('/');
  await page.getByRole('button', { name: /Need an account/ }).click();
  await page.getByLabel('Name').fill('Browser Test User');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('test-password-123');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('heading', { name: 'Projects and tasks' })).toBeVisible();

  await page.getByLabel('New project name').fill(project);
  await page.getByRole('button', { name: 'Create project' }).click();
  await expect(page.getByRole('button', { name: new RegExp(project) })).toBeVisible();

  await page.getByLabel('New task title').fill(task);
  await page.getByRole('button', { name: 'Add task' }).click();
  await expect(page.getByText(task, { exact: true })).toBeVisible();

  await page.getByRole('combobox', { name: 'Status for ' + task }).selectOption('DONE');
  await expect(page.getByRole('status')).toContainText('Task saved');
  await page.reload();

  await expect(page.getByRole('button', { name: new RegExp(project) })).toBeVisible();
  await expect(page.getByText(task, { exact: true })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Status for ' + task })).toHaveValue('DONE');
});
