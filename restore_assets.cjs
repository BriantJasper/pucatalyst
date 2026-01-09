const fs = require("fs");
const path = require("path");

const assetsDir = path.resolve("public/assets/3d");
const backupDir = path.resolve("public/assets/3d/backup");

if (!fs.existsSync(backupDir)) {
    console.error("No backup directory found!");
    process.exit(1);
}

const files = fs.readdirSync(backupDir).filter((f) => f.endsWith(".glb"));

files.forEach((file) => {
    const backupPath = path.join(backupDir, file);
    const targetPath = path.join(assetsDir, file);

    console.log(`Restoring ${file}...`);
    fs.copyFileSync(backupPath, targetPath);
});

console.log("Restoration complete.");
