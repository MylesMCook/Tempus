import { chromium } from '/Users/mylescook/node_modules/playwright-core/index.mjs';
import { writeFileSync } from 'node:fs';
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
try {
 await page.goto('http://127.0.0.1:5175');
 const input = page.locator('#date-expression');
 await input.focus(); await page.keyboard.press('ControlOrMeta+A');
 const text = 'Call Sam tomorrow at noon'.padEnd(200, ' ') + 'except on holidays';
 await page.keyboard.insertText(text);
 const result={requested:text,actual:await input.inputValue(),body:await page.locator('body').innerText()};
 writeFileSync(process.argv[2],JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({requestedLength:text.length,actualLength:result.actual.length,retained:result.actual===text,body:result.body.slice(0,1100)}));
}finally{await browser.close();}
