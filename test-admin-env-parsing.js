// Test how the ADMIN_EMAILS environment variable is being parsed

// Simulate the environment variable with quotes
const ADMIN_EMAILS_WITH_QUOTES = '"admin@innerspell.com"';
const ADMIN_EMAILS_WITHOUT_QUOTES = 'admin@innerspell.com';
const ADMIN_EMAILS_MULTIPLE = 'admin@innerspell.com,junsupark9999@gmail.com';

function parseAdminEmails(adminEmailsEnv) {
  const adminEmails = (adminEmailsEnv || 'admin@innerspell.com')
    .split(',')
    .map(email => email.trim().replace(/\n/g, ''));
  
  return adminEmails;
}

// Test 1: With quotes
console.log('Test 1 - ADMIN_EMAILS with quotes:');
const emails1 = parseAdminEmails(ADMIN_EMAILS_WITH_QUOTES);
console.log('Parsed emails:', emails1);
console.log('Includes admin@innerspell.com?', emails1.includes('admin@innerspell.com'));
console.log('First email:', `"${emails1[0]}"`, 'Length:', emails1[0].length);
console.log('');

// Test 2: Without quotes  
console.log('Test 2 - ADMIN_EMAILS without quotes:');
const emails2 = parseAdminEmails(ADMIN_EMAILS_WITHOUT_QUOTES);
console.log('Parsed emails:', emails2);
console.log('Includes admin@innerspell.com?', emails2.includes('admin@innerspell.com'));
console.log('First email:', `"${emails2[0]}"`, 'Length:', emails2[0].length);
console.log('');

// Test 3: Multiple emails
console.log('Test 3 - Multiple emails:');
const emails3 = parseAdminEmails(ADMIN_EMAILS_MULTIPLE);
console.log('Parsed emails:', emails3);
console.log('');

// Test 4: With quotes and newline characters (from .env.local)
const ADMIN_EMAILS_FROM_ENV = '"admin@innerspell.com"\n';
console.log('Test 4 - From .env.local with quotes and newline:');
const emails4 = parseAdminEmails(ADMIN_EMAILS_FROM_ENV);
console.log('Parsed emails:', emails4);
console.log('Includes admin@innerspell.com?', emails4.includes('admin@innerspell.com'));
console.log('First email:', `"${emails4[0]}"`, 'Length:', emails4[0].length);
console.log('');

// Fix: Remove quotes and special characters
function parseAdminEmailsFixed(adminEmailsEnv) {
  const adminEmails = (adminEmailsEnv || 'admin@innerspell.com')
    .split(',')
    .map(email => email.trim().replace(/\n/g, '').replace(/"/g, ''));
  
  return adminEmails;
}

console.log('Test 5 - Fixed parsing (removes quotes):');
const emails5 = parseAdminEmailsFixed(ADMIN_EMAILS_FROM_ENV);
console.log('Parsed emails:', emails5);
console.log('Includes admin@innerspell.com?', emails5.includes('admin@innerspell.com'));
console.log('First email:', `"${emails5[0]}"`, 'Length:', emails5[0].length);