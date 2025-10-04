/**
 * PDF Coordinate Detection using pdfjs-dist
 * Alternative to pdfreader for comparison
 */

const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

/**
 * Get coordinates using pdfjs-dist
 * @param {Buffer} pdfBuffer - PDF buffer
 * @param {Array} signatureDetails - Signature details with pages and tags
 * @returns {Promise<Array>} - Coordinates results
 */
export const getCoordinatesWithPdfjs = async (pdfBuffer, signatureDetails) => {
  console.log("[getCoordinatesWithPdfjs] Starting...");

  try {
    // Load PDF
    const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
    const pdfDocument = await loadingTask.promise;

    console.log(`[getCoordinatesWithPdfjs] Total pages: ${pdfDocument.numPages}`);

    const results = [];

    for (const detail of signatureDetails) {
      const { id, sign_pages, tag_coordinate } = detail;
      const pages = typeof sign_pages === 'string' ? JSON.parse(sign_pages) : sign_pages;
      const coordinates = [];

      console.log(`[getCoordinatesWithPdfjs] Processing detail ID: ${id}`);
      console.log(`  Pages: ${pages.join(', ')}`);
      console.log(`  Tag: "${tag_coordinate}"`);

      for (const pageNumber of pages) {
        if (pageNumber < 1 || pageNumber > pdfDocument.numPages) {
          console.warn(`  Page ${pageNumber} out of range`);
          coordinates.push({
            page: pageNumber,
            tag: tag_coordinate,
            found: false,
            error: "Page out of range"
          });
          continue;
        }

        console.log(`  Searching in page ${pageNumber}...`);

        // Get page
        const page = await pdfDocument.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.0 });
        const textContent = await page.getTextContent();

        console.log(`    Page size: ${viewport.width}x${viewport.height}`);
        console.log(`    Text items: ${textContent.items.length}`);

        // Find tag in text items
        let found = false;
        for (const item of textContent.items) {
          if (item.str === tag_coordinate || item.str.includes(tag_coordinate)) {
            // pdfjs-dist transform: [scaleX, skewY, skewX, scaleY, translateX, translateY]
            const transform = item.transform;
            const x = Math.round(transform[4]); // translateX
            const y = Math.round(transform[5]); // translateY

            console.log(`    ✓ Found "${tag_coordinate}" at (${x}, ${y})`);

            coordinates.push({
              page: pageNumber,
              tag: tag_coordinate,
              originX: x,
              originY: y,
              found: true,
              pageWidth: Math.round(viewport.width),
              pageHeight: Math.round(viewport.height),
            });

            found = true;
            break;
          }
        }

        if (!found) {
          console.log(`    ✗ Tag "${tag_coordinate}" not found`);
          coordinates.push({
            page: pageNumber,
            tag: tag_coordinate,
            found: false,
            error: "Tag not found"
          });
        }
      }

      results.push({
        id,
        tag_coordinate,
        coordinates
      });
    }

    console.log("[getCoordinatesWithPdfjs] ✓ Completed");
    return results;

  } catch (error) {
    console.error("[getCoordinatesWithPdfjs] Error:", error);
    throw error;
  }
};
