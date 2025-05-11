import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to recursively find all .tsx files
function findTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findTsxFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to convert .tsx to .jsx
function convertTsxToJsx(filePath) {
  // Read the file content
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace TypeScript specific syntax
  content = content
    // Remove type imports
    .replace(/import\s+type\s+.*?from\s+['"].*?['"]/g, '')
    // Remove interfaces and types
    .replace(/^(export\s+)?(interface|type)\s+.*?{[\s\S]*?}(\s*;)?$/gm, '')
    // Remove type annotations from function parameters
    .replace(/:\s*([A-Za-z0-9_<>[\].,\s|]+)(\s*=\s*)/g, '$2')
    // Remove type annotations from variables
    .replace(/:\s*([A-Za-z0-9_<>[\].,\s|]+)(\s*=\s*)/g, '$2')
    // Remove type assertions
    .replace(/<([^>]+)>/g, '')
    .replace(/as\s+([A-Za-z0-9_<>[\].,\s|]+)/g, '')
    // Remove non-null assertions
    .replace(/!\./g, '.')
    .replace(/!;/g, ';')
    .replace(/!,/g, ',')
    .replace(/!\)/g, ')')
    // Update import paths from .tsx to .jsx
    .replace(/from\s+['"](.+)\.tsx['"]/g, "from '$1.jsx'")
    .replace(/import\s+['"](.+)\.tsx['"]/g, "import '$1.jsx'");
  
  // Create new file path with .jsx extension
  const newFilePath = filePath.replace(/\.tsx?$/, '.jsx');
  
  // Write the converted content to the new file
  fs.writeFileSync(newFilePath, content);
  console.log(`Converted ${filePath} to ${newFilePath}`);
  
  return newFilePath;
}

// Main function
function main() {
  const srcDir = path.join(__dirname, 'src');
  const tsxFiles = findTsxFiles(srcDir);
  
  console.log(`Found ${tsxFiles.length} .tsx files to convert`);
  
  // Convert each file
  const convertedFiles = tsxFiles.map(convertTsxToJsx);
  
  console.log(`Successfully converted ${convertedFiles.length} files`);
}

main(); 