/* eslint-disable no-console */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if nvm is available
function isNvmAvailable() {
  try {
    execSync('nvm --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Read target Node.js version from .nvmrc file
const nvmrcPath = path.join(__dirname, '..', '.nvmrc');
let requiredVersion;

try {
  requiredVersion = fs.readFileSync(nvmrcPath, 'utf8').trim().replace('v', '');
} catch (error) {
  console.error('❌ Failed to read .nvmrc file, please ensure the file exists and is formatted correctly!');
  process.exit(1);
}

// Get current Node.js version
const currentVersion = process.version.replace('v', '');

console.log(`🔍 Detected required Node.js version: ${requiredVersion}`);
console.log(`🔍 Current Node.js version: ${currentVersion}`);

// Exit directly if versions match
if (currentVersion === requiredVersion) {
  console.log('✅ Version matched, no switching needed');
  process.exit(0);
}

// Check if nvm is installed
if (!isNvmAvailable()) {
  console.error('❌ nvm not detected, please install nvm first:');
  console.error('   Download URL: https://github.com/coreybutler/nvm-windows');
  process.exit(1);
}

console.log('🔄 nvm detected, checking if target version exists...');

try {
  // Check if target version is installed
  const installedVersions = execSync('nvm list', { encoding: 'utf8' });

  // Normalize version format for comparison
  const normalizedRequiredVersion = requiredVersion.startsWith('v') ? requiredVersion : `v${requiredVersion}`;

  if (!installedVersions.includes(requiredVersion) && !installedVersions.includes(normalizedRequiredVersion)) {
    console.log(`⚠️  Node.js v${requiredVersion} is not installed, attempting to install...`);
    try {
      execSync(`nvm install ${requiredVersion}`, { stdio: 'inherit' });
      console.log('✅ Installation completed successfully!');
    } catch (installError) {
      console.error(`❌ Failed to install Node.js v${requiredVersion}`);
      console.error(`   Please manually install: nvm install ${requiredVersion}`);
      process.exit(1);
    }
  }

  // Switch to target version
  console.log(`🔄 Switching to Node.js v${requiredVersion}...`);
  execSync(`nvm use ${requiredVersion}`, { stdio: 'inherit' });

  // Verify switch was successful
  const newVersion = process.version.replace('v', '');
  if (newVersion !== requiredVersion) {
    console.error('❌ Version switching failed');
    console.error('   This might be due to Windows environment issues');
    console.error('   Try running these commands manually:');
    console.error(`   nvm use ${requiredVersion}`);
    console.error('   Or restart your terminal/command prompt');
    process.exit(1);
  }

  console.log('✅ Version switched successfully!');

  // Re-execute original command if provided
  const originalCommand = process.argv.slice(2).join(' ');
  if (originalCommand) {
    console.log(`🚀 Executing command: ${originalCommand}`);
    execSync(originalCommand, { stdio: 'inherit' });
  }
} catch (error) {
  console.error('❌ Version switching failed:', error.message);
  console.error(`   Please manually install and switch to Node.js v${requiredVersion}`);
  console.error(`   Install command: nvm install ${requiredVersion}`);
  console.error(`   Switch command: nvm use ${requiredVersion}`);
  console.error('   Note: On Windows, you may need to restart your terminal after switching versions');
  process.exit(1);
}
