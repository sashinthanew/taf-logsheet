const fs = require('fs');
const path = require('path');

const dirsToCreate = [
  path.join(__dirname, 'routes'),
  path.join(__dirname, 'middleware')
];

dirsToCreate.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  } else {
    console.log(`Directory already exists: ${dir}`);
  }
});

console.log('Setup complete!');
