import crypto from 'crypto';
import { promisify } from 'util';
const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function main() {
  const originalPassword = 'I.Am.Dev.1';
  // Use a specific salt we found in the DB
  const salt = '6c2c18c8ca6c98ec';
  
  const hashedPassword = await hashPassword(originalPassword, salt);
  console.log('Hashed password:', hashedPassword);
  console.log('Last 20 chars:', hashedPassword.slice(-20));
}

main().catch(console.error);