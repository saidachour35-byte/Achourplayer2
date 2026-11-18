import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const zip = new JSZip();

function addDirToZip(dirPath: string, zipFolder: JSZip, baseDir: string) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(baseDir, fullPath);

    const parts = relativePath.split(path.sep);

    // Skip ignored directories/files
    if (
      parts.includes('node_modules') ||
      parts.includes('.git') ||
      parts.includes('dist') ||
      parts.includes('.gradle') ||
      parts.includes('build') ||
      entry.name === '.DS_Store' ||
      entry.name === '.env' ||
      entry.name.endsWith('.zip')
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      const subFolder = zipFolder.folder(entry.name);
      if (subFolder) {
        addDirToZip(fullPath, subFolder, baseDir);
      }
    } else if (entry.isFile()) {
      const content = fs.readFileSync(fullPath);
      zipFolder.file(entry.name, content);
    }
  }
}

async function createZip() {
  const rootDir = path.resolve('/app/applet');
  const targetZipPath = path.resolve(rootDir, 'public', 'AchourPlayer-Complete.zip');

  console.log('Building complete project zip...');
  addDirToZip(rootDir, zip, rootDir);

  const content = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(targetZipPath, content);
  console.log('Complete project zip created at:', targetZipPath);
}

createZip().catch(err => {
  console.error('Error creating zip:', err);
  process.exit(1);
});
