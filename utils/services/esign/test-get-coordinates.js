/**
 * Test script for getCoordinates function using pdfreader
 *
 * Usage: node utils/services/esign/test-get-coordinates.js [pdf-file-path]
 *
 * Example:
 *   node utils/services/esign/test-get-coordinates.js ./document.pdf
 */

const fs = require('fs');
const path = require('path');

async function testGetCoordinates() {
  try {
    console.log("=".repeat(60));
    console.log("TEST: Get Coordinates from PDF (using pdfreader)");
    console.log("=".repeat(60));

    // Get PDF path from command line or use default
    const pdfPath = process.argv[2] || path.join(process.cwd(), 'test-files', 'sample.pdf');

    if (!fs.existsSync(pdfPath)) {
      console.error("❌ PDF file not found:", pdfPath);
      console.log("\n📝 Usage:");
      console.log("  node utils/services/esign/test-get-coordinates.js [pdf-file-path]");
      console.log("\n💡 Example:");
      console.log("  node utils/services/esign/test-get-coordinates.js ./document.pdf");
      console.log("\nMake sure your PDF has tag characters like '$' or '#TTE#' in it");
      return;
    }

    const pdfBuffer = fs.readFileSync(pdfPath);
    console.log("✓ PDF loaded:", pdfPath);
    console.log("  File size:", pdfBuffer.length, "bytes\n");

    // Example signature details
    const signatureDetails = [
      {
        id: "signer-1",
        sign_pages: [1, 2],
        tag_coordinate: "$"
      },
      {
        id: "signer-2",
        sign_pages: [1],
        tag_coordinate: "#"
      }
    ];

    console.log("📋 Signature details to process:");
    console.log(JSON.stringify(signatureDetails, null, 2));
    console.log("");

    // Import function
    const { getCoordinates } = require('./pdf.service');

    console.log("🔍 Searching for tags...\n");

    // Get coordinates
    const startTime = Date.now();
    const results = await getCoordinates(pdfBuffer, signatureDetails);
    const duration = Date.now() - startTime;

    console.log("\n" + "=".repeat(60));
    console.log("📊 RESULTS:");
    console.log("=".repeat(60));
    console.log(JSON.stringify(results, null, 2));

    console.log("\n" + "=".repeat(60));
    console.log("📝 SUMMARY:");
    console.log("=".repeat(60));

    for (const result of results) {
      console.log(`\n👤 Signer ID: ${result.id}`);
      console.log(`🏷️  Tag: "${result.tag_coordinate}"`);

      for (const coord of result.coordinates) {
        if (coord.found) {
          console.log(
            `  ✓ Page ${coord.page}: bottom-left (X=${coord.originX}, Y=${coord.originY}) | top-left (Y=${coord.originYTopLeft})`
          );
          console.log(`    Page size: ${coord.pageWidth} x ${coord.pageHeight}`);
        } else {
          console.log(`  ✗ Page ${coord.page}: Not found - ${coord.error || 'Tag not found'}`);
        }
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log(`✅ TEST COMPLETED in ${duration}ms`);
    console.log("=".repeat(60));

  } catch (error) {
    console.error("\n" + "=".repeat(60));
    console.error("❌ ERROR:", error.message);
    console.error("=".repeat(60));
    console.error(error.stack);
    process.exit(1);
  }
}

// Run test
testGetCoordinates();
