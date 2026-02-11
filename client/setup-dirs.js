const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components');

if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true });
  console.log(`Created directory: ${componentsDir}`);
} else {
  console.log(`Directory already exists: ${componentsDir}`);
}

console.log('Client setup complete!');
