import { newE2EPage } from '@stencil/core/testing';

describe('sc-datagrid', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<sc-datagrid></sc-datagrid>');

    const element = await page.find('sc-datagrid');
    expect(element).toHaveClass('hydrated');
  });
});
