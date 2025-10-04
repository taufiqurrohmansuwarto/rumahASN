/**
 * Compare coordinate detection: pdfreader vs pdfjs-dist
 */

const fs = require('fs');
const path = require('path');

// Import both implementations
const { getCoordinates } = require('./pdf.service');
const { getCoordinatesWithPdfjs } = require('./pdf-pdfjs.service');

async function compareLibraries() {
  // Read test PDF
  const pdfPath = process.argv[2];
  if (!pdfPath) {
    console.error("Usage: node test-compare-libraries.js <path-to-pdf>");
    process.exit(1);
  }

  const pdfBuffer = fs.readFileSync(pdfPath);

  // Test signature details
  const signatureDetails = [
    {
      id: "test-1",
      sign_pages: [1, 2],
      tag_coordinate: "$"
    }
  ];

  console.log("=".repeat(80));
  console.log("COMPARING PDF LIBRARIES");
  console.log("=".repeat(80));

  // Test with pdfreader
  console.log("\n📚 Testing with PDFREADER:");
  console.log("-".repeat(80));
  const pdfreaderResults = await getCoordinates(pdfBuffer, signatureDetails);
  console.log("\nPDFREADER Results:", JSON.stringify(pdfreaderResults, null, 2));

  // Test with pdfjs-dist
  console.log("\n📚 Testing with PDFJS-DIST:");
  console.log("-".repeat(80));
  const pdfjsResults = await getCoordinatesWithPdfjs(pdfBuffer, signatureDetails);
  console.log("\nPDFJS-DIST Results:", JSON.stringify(pdfjsResults, null, 2));

  // Compare
  console.log("\n" + "=".repeat(80));
  console.log("COMPARISON:");
  console.log("=".repeat(80));

  const pdfReaderCoords = pdfreaderResults[0]?.coordinates || [];
  const pdfjsCoords = pdfjsResults[0]?.coordinates || [];

  for (let i = 0; i < Math.max(pdfReaderCoords.length, pdfjsCoords.length); i++) {
    const pr = pdfReaderCoords[i];
    const pj = pdfjsCoords[i];

    console.log(`\nPage ${pr?.page || pj?.page}:`);
    console.log(
      `  pdfreader: ${
        pr?.found
          ? `bottom-left (${pr.originX}, ${pr.originY}) | top-left (Y=${pr.originYTopLeft})`
          : 'NOT FOUND'
      }`
    );
    console.log(
      `  pdfjs-dist: ${
        pj?.found
          ? `bottom-left (${pj.originX}, ${pj.originY}) | top-left (Y=${pj.originYTopLeft})`
          : 'NOT FOUND'
      }`
    );

    if (pr?.found && pj?.found) {
      const diffX = Math.abs(pr.originX - pj.originX);
      const diffY = Math.abs(pr.originY - pj.originY);
      console.log(`  Difference: ΔX=${diffX}, ΔY=${diffY}`);

      if (diffX === 0 && diffY === 0) {
        console.log(`  ✅ IDENTICAL`);
      } else if (diffX < 10 && diffY < 10) {
        console.log(`  ⚠️  CLOSE (minor difference)`);
      } else {
        console.log(`  ❌ DIFFERENT`);
      }
    }
  }

  console.log("\n" + "=".repeat(80));
}

compareLibraries().catch(console.error);
