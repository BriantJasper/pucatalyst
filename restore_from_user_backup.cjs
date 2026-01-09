const fs = require("fs");
const path = require("path");

const assetsDir = path.resolve("public/assets/3d");
const backupDir = path.resolve("public/assets/3d_backup");

if (!fs.existsSync(backupDir)) {
    console.error("User backup directory not found:", backupDir);
    process.exit(1);
}

// Ensure assets dir exists
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

const files = fs.readdirSync(backupDir).filter((f) => f.endsWith(".glb"));

console.log(`Found ${files.length} backup files in ${backupDir}`);

files.forEach((file) => {
    const backupPath = path.join(backupDir, file);
    const targetPath = path.join(assetsDir, file);

    try {
        fs.copyFileSync(backupPath, targetPath);
        console.log(
            `Restored ${file} (${(
                fs.statSync(targetPath).size /
                1024 /
                1024
            ).toFixed(2)} MB)`
        );
    } catch (e) {
        console.error(`Failed to restore ${file}:`, e.message);
    }
});

console.log("Restoration from user backup complete.");
