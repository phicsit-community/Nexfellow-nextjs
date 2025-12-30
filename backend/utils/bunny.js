const https = require("https");
const path = require("path");
const fs = require("fs");

const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE;
const BUNNY_STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY;
const BUNNY_CDN_URL = process.env.BUNNY_CDN_URL; // e.g., 'https://nexfellow.b-cdn.net'
const BUNNY_STORAGE_HOST =
  process.env.BUNNY_STORAGE_HOST || "storage.bunnycdn.com";

// Upload a file to Bunny Storage
async function upload(localFilePath, targetPath = null) {
  if (!localFilePath) throw new Error("File path is required");
  if (!BUNNY_STORAGE_ZONE || !BUNNY_STORAGE_API_KEY || !BUNNY_CDN_URL) {
    throw new Error("Bunny.net environment variables are not set");
  }
  const fileName = path.basename(localFilePath);
  const remotePath = targetPath || `uploads/${fileName}`;
  const options = {
    hostname: BUNNY_STORAGE_HOST,
    path: `/${BUNNY_STORAGE_ZONE}/${remotePath}`,
    method: "PUT",
    headers: {
      AccessKey: BUNNY_STORAGE_API_KEY,
      "Content-Type": "application/octet-stream",
      "Content-Length": fs.statSync(localFilePath).size,
    },
  };
  const fileStream = fs.createReadStream(localFilePath);
  await new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      if (res.statusCode === 201) {
        resolve();
      } else {
        reject(new Error(`Bunny Storage upload failed: ${res.statusCode}`));
      }
    });
    req.on("error", reject);
    fileStream.pipe(req);
  });
  return {
    url: `${BUNNY_CDN_URL}/${remotePath}`,
    path: remotePath,
  };
}

// Remove a file from Bunny Storage
async function remove(remotePath) {
  if (!remotePath) throw new Error("Remote path is required");
  if (!BUNNY_STORAGE_ZONE || !BUNNY_STORAGE_API_KEY) {
    throw new Error("Bunny.net environment variables are not set");
  }
  const options = {
    hostname: BUNNY_STORAGE_HOST,
    path: `/${BUNNY_STORAGE_ZONE}/${remotePath}`,
    method: "DELETE",
    headers: {
      AccessKey: BUNNY_STORAGE_API_KEY,
    },
  };
  await new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      if (res.statusCode === 200) {
        resolve();
      } else {
        reject(new Error(`Bunny Storage delete failed: ${res.statusCode}`));
      }
    });
    req.on("error", reject);
    req.end();
  });
  return true;
}

module.exports = { upload, remove };
