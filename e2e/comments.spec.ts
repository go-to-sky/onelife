import { test, expect } from '@playwright/test';

test('create and delete a comment flow', async ({ page }) => {
  await page.goto('/exhibit/learning-to-say-no');

  // 发表评论
  await page.getByPlaceholder('写下你的想法...').click();
  const content = `e2e comment ${Date.now()}`;
  await page.getByPlaceholder('写下你的想法...').fill(content);
  await page.getByRole('button', { name: '发布评论' }).click();

  // 评论应出现在页面
  await expect(page.getByText(content)).toBeVisible({ timeout: 10000 });

  // 删除评论（点击该评论附近的删除按钮）
  const commentLocator = page.locator('text=' + content).first();
  const container = commentLocator.locator('..');
  await container.getByRole('button', { name: '删除' }).click();
  // 确认弹窗
  page.on('dialog', dialog => dialog.accept());

  // 删除后不可见
  await expect(page.getByText(content)).toHaveCount(0);
});


