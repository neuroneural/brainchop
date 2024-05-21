const { test, expect} = require('@playwright/test');

// we want to save timing info from the models to timing.json
// so we can compare the performance of the models in different browsers
const fs = require('fs');
const timing = {};

// Helper function to wait for the specific log message
async function waitForLogMessage(page, browserName, modelIndex) {
  // Create a promise that resolves when the specific log message is found
  const logMessagePromise = new Promise((resolve, reject) => {
    page.on('console', (msg) => {
      const msgText = msg.text();
      if (msgText.includes('Processing the whole brain volume in tfjs for multi-class output mask took :')) {
        // Parse the time in milliseconds
        const time = parseFloat(msgText.split('took : ')[1].split(' Seconds')[0]) * 1000;
        // Save timing info based on browser name and the model index
        if (!timing[browserName]) {
          timing[browserName] = {};
        }
        timing[browserName][`modelIndex${modelIndex}`] = time;
        // log it
        console.log(`Model index ${modelIndex} took ${time} ms in ${browserName}`);
        // Write to file
        fs.writeFileSync('timing.json', JSON.stringify(timing, null, 2));
        resolve(); // Resolve the promise
      }
    });

    // Set a timeout to reject the promise if the message is not found within a reasonable time
    setTimeout(() => {
      reject(new Error('Log message not found within the timeout period'));
    }, 30000); // 30 second timeout
  });

  try {
    // Wait for the log message promise to resolve
    await logMessagePromise;
  } catch (error) {
    console.error(error.message);
  }
}


// test a quick (small) model
test('model 11', async ({ page, browserName }, testInfo) => {
  // Load timing file if it exists
  if (fs.existsSync('timing.json')) {
    const data = fs.readFileSync('timing.json', 'utf8');
    if (data) {
      Object.assign(timing, JSON.parse(data));
    }
  }
  const modelIndex = 11;
  await page.goto(`http://127.0.0.1:8088/?model=${modelIndex}`);
  await waitForLogMessage(page, browserName, modelIndex);
  // take snapshot of canvas element gl1
  const canvas = await page.$('canvas#gl1');
  const snapshot = await canvas.screenshot();
  // attach the snapshot to the test report
  await testInfo.attach('Snapshot', { body: snapshot, contentType: 'image/png' });
  expect(snapshot).toMatchSnapshot();
});
