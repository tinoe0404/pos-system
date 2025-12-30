const bcrypt = require('bcrypt');

async function generateHash(password) {
  const hash = await bcrypt.hash(password, 10);
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}\n`);
}

generateHash('admin123');
generateHash('cashier123');