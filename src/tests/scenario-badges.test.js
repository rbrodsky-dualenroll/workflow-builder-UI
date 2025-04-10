const puppeteer = require('puppeteer');
const path = require('path');

/**
 * Test that scenario badges appear correctly
 */
async function testScenarioBadges() {
  console.log('Starting scenario badges test...');
  
  // Launch browser
  const browser