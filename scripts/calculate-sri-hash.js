#!/usr/bin/env node
/* eslint-disable no-undef */

/**
 * Script tính hash SRI (Subresource Integrity) cho CDN resources
 *
 * Usage:
 *   node scripts/calculate-sri-hash.js <URL>
 *
 * Example:
 *   node scripts/calculate-sri-hash.js "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
 */

import crypto from "crypto";
import https from "https";
import http from "http";

const url = process.argv[2];

if (!url) {
  console.error("❌ Lỗi: Thiếu URL");
  console.error("\nUsage:");
  console.error("  node scripts/calculate-sri-hash.js <URL>");
  console.error("\nExample:");
  console.error(
    '  node scripts/calculate-sri-hash.js "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"'
  );
  process.exit(1);
}

// Validate URL
let parsedUrl;
try {
  parsedUrl = new URL(url);
} catch (error) {
  console.error("❌ Lỗi: URL không hợp lệ");
  console.error("Error:", error.message);
  process.exit(1);
}

// Choose http or https
const httpModule = parsedUrl.protocol === "https:" ? https : http;

console.log("🔄 Đang tải resource từ CDN...");
console.log(`URL: ${url}\n`);

const request = httpModule.get(url, (res) => {
  // Check status code
  if (res.statusCode !== 200) {
    console.error(`❌ Lỗi: HTTP ${res.statusCode}`);
    console.error("Resource không thể tải được");
    process.exit(1);
  }

  let data = "";
  let totalSize = 0;

  res.on("data", (chunk) => {
    data += chunk;
    totalSize += chunk.length;
  });

  res.on("end", () => {
    if (data.length === 0) {
      console.error("❌ Lỗi: Resource rỗng");
      process.exit(1);
    }

    console.log(`✅ Đã tải thành công (${totalSize} bytes)\n`);
    console.log("🔄 Đang tính hash SRI...\n");

    // Calculate hashes
    const sha256 = crypto
      .createHash("sha256")
      .update(data, "utf8")
      .digest("base64");
    const sha384 = crypto
      .createHash("sha384")
      .update(data, "utf8")
      .digest("base64");
    const sha512 = crypto
      .createHash("sha512")
      .update(data, "utf8")
      .digest("base64");

    // Display results
    console.log("═══════════════════════════════════════════════════════");
    console.log("📋 KẾT QUẢ HASH SRI:");
    console.log("═══════════════════════════════════════════════════════\n");

    console.log("🔹 SHA-256 (không khuyến nghị):");
    console.log(`integrity="sha256-${sha256}"\n`);

    console.log("🔹 SHA-384 (KHUYẾN NGHỊ):");
    console.log(`integrity="sha384-${sha384}"\n`);

    console.log("🔹 SHA-512 (an toàn nhất, nhưng dài):");
    console.log(`integrity="sha512-${sha512}"\n`);

    console.log("═══════════════════════════════════════════════════════\n");

    // Generate HTML example
    const resourceType =
      url.includes(".css") || url.includes("css2") ? "stylesheet" : "script";
    const tag = resourceType === "stylesheet" ? "link" : "script";

    console.log("💡 Ví dụ sử dụng trong HTML:\n");

    if (tag === "link") {
      console.log(`<link 
  rel="stylesheet" 
  href="${url}"
  integrity="sha384-${sha384}" 
  crossorigin="anonymous">\n`);
    } else {
      console.log(`<script 
  src="${url}"
  integrity="sha384-${sha384}" 
  crossorigin="anonymous"></script>\n`);
    }

    console.log("✅ Hoàn thành!");
    console.log("\n⚠️  Lưu ý:");
    console.log("   - Nếu resource thay đổi, hash sẽ thay đổi");
    console.log("   - Phải tính lại hash khi update resource");
    console.log('   - Luôn sử dụng crossorigin="anonymous" với SRI');
  });
});

request.on("error", (error) => {
  console.error("❌ Lỗi khi tải resource:");
  console.error("   ", error.message);
  console.error("\n💡 Kiểm tra:");
  console.error("   - URL có đúng không?");
  console.error("   - Có kết nối internet không?");
  console.error("   - CDN có đang hoạt động không?");
  process.exit(1);
});

request.setTimeout(30000, () => {
  console.error("❌ Lỗi: Timeout khi tải resource (quá 30 giây)");
  request.destroy();
  process.exit(1);
});
