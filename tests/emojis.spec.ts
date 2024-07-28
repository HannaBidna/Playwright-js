import { test, expect, APIRequestContext } from '@playwright/test';
import { API } from '../scr/pages/helpers/api';
import { InOutPage } from '../scr/pages/loginPage';
import { goto } from '../Playwright/navigatable';


const emojiMap: { [key: string]: string } = {
  '0': '😀',
  '1': '🫠',
  '2': '🫨',
  '3': '🤤',
  '4': '🤥',
  '5': '🥵',
  '6': '😎',
  '7': '🤢',
  '8': '👺',
  '9': '👽️'
};
const replaceDigitsWithEmojis = (input: string) => {
  return input.replace(/\d/g, (match) => emojiMap[match]);
};

test.describe('Emojis', () => {
  let token: string;
  

  test.beforeEach(async ({ page, context }) => {
    const loginPage = new InOutPage(page);
        await goto(loginPage);
        await loginPage.loginWithValidCredentials();
        const cookies = await context.cookies();
    token = cookies.find(e => e.name == 'tms_token')!.value;
  });

  test('Api trucks', async ({ request }) => {
    const api = new API(request);
    const data = await api.get('trucks', token);
    console.log(data);
  });

  test('Correct number of trucks in a table', async ({ page, truckPage, api }) => {
    await goto(truckPage);
    await page.waitForSelector('[class="v-data-table__tr"]');
    const trucks_Table = await page.locator('[class="v-data-table__tr"]').count();
    const { items } = await api.get('trucks');
    expect(items.length).toBe(trucks_Table);
  })
});

test('Replace numbers with emojis in Dims & payload column', async ({ page }) => {
  await page.route('**/api/v1/trucks?page=*', async (route, request) => {
    const response = await route.fetch();
    const json = await response.json();

  
    json.data.forEach((truck: any) => {
      truck.dims_payload = replaceDigitsWithEmojis(truck.dims_payload);
    });

    route.fulfill({
      response,
      body: JSON.stringify(json),
    });
  });

  await goto(truckPage);
  await page.waitForSelector('table');
});
