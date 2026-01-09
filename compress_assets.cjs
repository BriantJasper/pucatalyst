const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const assetsDir = path.resolve("public/assets/3d");
const backupDir = path.resolve("public/assets/3d/backup");

if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log("Created backup directory:", backupDir);
}

const files = fs.readdirSync(assetsDir).filter((f) => f.endsWith(".glb"));

console.log(`Found ${files.length} GLB files to optimize.`);

files.forEach((file) => {
    const originalPath = path.join(assetsDir, file);
    const backupPath = path.join(backupDir, file);

    // 1. Backup
    if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(originalPath, backupPath);
        console.log(`Backed up ${file}`);
    } else {
        console.log(`Backup for ${file} already exists, using it as source.`);
    }

    // 2. Compress
    // Input is the BACKUP (original uncompressed), Output is the LIVE file
    console.log(`Compressing ${file}...`);
    try {
        // Use npx to run gltf-pipeline
        // -d: Draco compression
        // -b: Output binary (glb)
        execSync(
            `npx -y gltf-pipeline -i "${backupPath}" -o "${originalPath}" -d -b`,
            { stdio: "inherit" }
        );

        const originalSize = fs.statSync(backupPath).size;
        const newSize = fs.statSync(originalPath).size;
        const savings = (
            ((originalSize - newSize) / originalSize) *
            100
        ).toFixed(1);

        console.log(
            `Compressed ${file}: ${(originalSize / 1024 / 1024).toFixed(
                2
            )}MB -> ${(newSize / 1024 / 1024).toFixed(2)}MB (${savings}% saved)`
        );
    } catch (error) {
        console.error(`Failed to compress ${file}:`, error.message);
    }
});
