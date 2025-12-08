#!/usr/bin/env node
/* eslint-disable no-undef */

/**
 * Script validation SRI (Subresource Integrity)
 *
 * Kiểm tra tất cả CDN resources trong project có SRI không
 *
 * Usage:
 *   node scripts/validate-sri.js
 *
 * Exit codes:
 *   0 - Tất cả CDN đều có SRI
 *   1 - Có CDN thiếu SRI
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Read files
let indexHtml, globalScss;
try {
  indexHtml = fs.readFileSync(path.join(projectRoot, "index.html"), "utf-8");
} catch (error) {
  log("❌ Không thể đọc index.html", "red");
  process.exit(1);
}

try {
  globalScss = fs.readFileSync(
    path.join(projectRoot, "src", "styles", "global.scss"),
    "utf-8"
  );
} catch (error) {
  log("⚠️  Không thể đọc global.scss (có thể không tồn tại)", "yellow");
  globalScss = "";
}

const errors = [];
const warnings = [];
const success = [];

log("\n🔍 Đang kiểm tra SRI cho tất cả CDN resources...\n", "cyan");

// Check CDN in HTML <link> tags
const linkTags = indexHtml.match(/<link[^>]*>/g) || [];
linkTags.forEach((tag) => {
  const href = tag.match(/href=["']([^"']+)["']/)?.[1];
  const integrity = tag.match(/integrity=["']([^"']+)["']/)?.[1];
  const crossorigin = tag.match(/crossorigin=["']([^"']+)["']/)?.[1];

  // If it's a CDN (not local)
  if (href && (href.startsWith("http://") || href.startsWith("https://"))) {
    if (!integrity) {
      errors.push({
        type: "link",
        url: href,
        message: "CDN trong HTML thiếu SRI (integrity attribute)",
        tag: tag.substring(0, 100) + "...",
      });
    } else if (integrity.includes("PLACEHOLDER")) {
      errors.push({
        type: "link",
        url: href,
        message: "CDN có placeholder hash - cần tính hash thực tế",
        tag: tag.substring(0, 100) + "...",
      });
    } else if (!crossorigin) {
      warnings.push({
        type: "link",
        url: href,
        message: "CDN trong HTML thiếu crossorigin attribute",
        tag: tag.substring(0, 100) + "...",
      });
    } else {
      success.push({
        type: "link",
        url: href,
        message: "CDN có SRI đầy đủ",
      });
    }
  }
});

// Check CDN in HTML <script> tags
const scriptTags =
  indexHtml.match(/<script[^>]*src=["']([^"']+)["'][^>]*>/g) || [];
scriptTags.forEach((tag) => {
  const src = tag.match(/src=["']([^"']+)["']/)?.[1];
  const integrity = tag.match(/integrity=["']([^"']+)["']/)?.[1];
  const crossorigin = tag.match(/crossorigin=["']([^"']+)["']/)?.[1];

  // If it's a CDN
  if (src && (src.startsWith("http://") || src.startsWith("https://"))) {
    if (!integrity) {
      errors.push({
        type: "script",
        url: src,
        message: "Script CDN trong HTML thiếu SRI (integrity attribute)",
        tag: tag.substring(0, 100) + "...",
      });
    } else if (integrity.includes("PLACEHOLDER")) {
      errors.push({
        type: "script",
        url: src,
        message: "Script CDN có placeholder hash - cần tính hash thực tế",
        tag: tag.substring(0, 100) + "...",
      });
    } else if (!crossorigin) {
      warnings.push({
        type: "script",
        url: src,
        message: "Script CDN trong HTML thiếu crossorigin attribute",
        tag: tag.substring(0, 100) + "...",
      });
    } else {
      success.push({
        type: "script",
        url: src,
        message: "Script CDN có SRI đầy đủ",
      });
    }
  }
});

// Check @import CDN in SCSS
const importMatches =
  globalScss.match(/@import\s+url\(["']([^"']+)["']\)/g) || [];
importMatches.forEach((match) => {
  const url = match.match(/url\(["']([^"']+)["']\)/)?.[1];
  if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
    warnings.push({
      type: "scss",
      url: url,
      message: "Tìm thấy @import CDN trong SCSS",
      suggestion: "Nên chuyển sang <link> tag trong HTML với SRI",
    });
  }
});

// Display results
log("═══════════════════════════════════════════════════════", "cyan");
log("📋 KẾT QUẢ VALIDATION SRI", "cyan");
log("═══════════════════════════════════════════════════════\n", "cyan");

if (success.length > 0) {
  log("✅ CDN có SRI:", "green");
  success.forEach((item) => {
    log(`   ${item.type.toUpperCase()}: ${item.url}`, "green");
  });
  log("");
}

if (errors.length === 0 && warnings.length === 0) {
  log("✅ Tất cả CDN đều có SRI!", "green");
  log("✅ Project của bạn được bảo vệ bởi SRI.\n", "green");
  process.exit(0);
} else {
  if (errors.length > 0) {
    log("❌ LỖI:", "red");
    errors.forEach((error, index) => {
      log(`\n   ${index + 1}. ${error.message}`, "red");
      log(`      URL: ${error.url}`, "red");
      if (error.tag) {
        log(`      Tag: ${error.tag}`, "red");
      }
      if (error.suggestion) {
        log(`      💡 ${error.suggestion}`, "yellow");
      }
    });
    log("");
  }

  if (warnings.length > 0) {
    log("⚠️  CẢNH BÁO:", "yellow");
    warnings.forEach((warning, index) => {
      log(`\n   ${index + 1}. ${warning.message}`, "yellow");
      log(`      URL: ${warning.url}`, "yellow");
      if (warning.suggestion) {
        log(`      💡 ${warning.suggestion}`, "yellow");
      }
    });
    log("");
  }

  log("═══════════════════════════════════════════════════════", "red");
  log("❌ VALIDATION THẤT BẠI", "red");
  log("═══════════════════════════════════════════════════════\n", "red");

  log("💡 Hướng dẫn sửa lỗi:", "cyan");
  log("   1. Tính hash SRI: node scripts/calculate-sri-hash.js <URL>", "cyan");
  log(
    "   2. Thêm integrity và crossorigin vào <link> hoặc <script> tag",
    "cyan"
  );
  log("   3. Xóa @import CDN từ SCSS và chuyển sang HTML\n", "cyan");

  process.exit(1);
}
