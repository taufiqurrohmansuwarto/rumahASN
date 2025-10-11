/**
 * Gotenberg Helper for HTML to PNG/PDF Conversion
 *
 * Requirements:
 * - Gotenberg service running on http://localhost:3000
 * - Run: docker run -d --name gotenberg -p 3000:3000 gotenberg/gotenberg:7
 */

const { Gotenberg } = require('gotenberg-js-client');

/**
 * Get Gotenberg client instance
 * @returns {Gotenberg}
 */
const getGotenbergClient = () => {
  const gotenbergUrl = process.env.GOTENBERG_URL || 'http://localhost:3000';
  return new Gotenberg(gotenbergUrl);
};

/**
 * Convert HTML to PNG image
 * @param {String} html - HTML string
 * @param {Object} options - Conversion options
 * @param {Number} options.width - Page width in inches (default: 8.27 = A4)
 * @param {Number} options.height - Page height in inches (default: 11.69 = A4)
 * @param {Number} options.quality - Image quality 1-100 (default: 90)
 * @param {Boolean} options.optimizeSize - Optimize for size (default: true)
 * @returns {Promise<Buffer>} - PNG buffer
 */
const convertHtmlToPng = async (html, options = {}) => {
  try {
    const {
      width = 8.27,    // A4 width in inches
      height = 11.69,  // A4 height in inches
      quality = 90,
      optimizeSize = true
    } = options;

    console.log('[Gotenberg] Converting HTML to PNG...');
    console.log('[Gotenberg] Page size:', width, 'x', height, 'inches');
    console.log('[Gotenberg] Quality:', quality);

    const gotenberg = getGotenbergClient();

    // Create form with HTML file
    const formData = {
      files: [
        {
          name: 'index.html',
          value: Buffer.from(html, 'utf-8')
        }
      ]
    };

    // Build request
    let request = gotenberg
      .html()
      .index(Buffer.from(html, 'utf-8'))
      .paperSize({ width, height })
      .marginTop(0)
      .marginBottom(0)
      .marginLeft(0)
      .marginRight(0);

    // Convert to screenshot (PNG)
    if (optimizeSize) {
      request = request
        .screenshot()
        .quality(quality)
        .optimizeForSpeed(false);
    } else {
      request = request.screenshot();
    }

    const pngBuffer = await request.convert();

    console.log('[Gotenberg] Conversion successful');
    console.log('[Gotenberg] PNG size:', (pngBuffer.length / 1024).toFixed(2), 'KB');

    return pngBuffer;
  } catch (error) {
    console.error('[Gotenberg] Conversion error:', error);
    throw new Error(`Gagal convert HTML ke PNG: ${error.message}`);
  }
};

/**
 * Convert HTML to PDF
 * @param {String} html - HTML string
 * @param {Object} options - Conversion options
 * @returns {Promise<Buffer>} - PDF buffer
 */
const convertHtmlToPdf = async (html, options = {}) => {
  try {
    const {
      width = 8.27,
      height = 11.69,
      landscape = false
    } = options;

    console.log('[Gotenberg] Converting HTML to PDF...');

    const gotenberg = getGotenbergClient();

    const pdfBuffer = await gotenberg
      .html()
      .index(Buffer.from(html, 'utf-8'))
      .paperSize({ width, height })
      .landscape(landscape)
      .marginTop(0)
      .marginBottom(0)
      .marginLeft(0)
      .marginRight(0)
      .convert();

    console.log('[Gotenberg] PDF conversion successful');
    console.log('[Gotenberg] PDF size:', (pdfBuffer.length / 1024).toFixed(2), 'KB');

    return pdfBuffer;
  } catch (error) {
    console.error('[Gotenberg] PDF conversion error:', error);
    throw new Error(`Gagal convert HTML ke PDF: ${error.message}`);
  }
};

/**
 * Test Gotenberg connection
 * @returns {Promise<Boolean>}
 */
const testGotenbergConnection = async () => {
  try {
    const testHtml = '<html><body><h1>Test</h1></body></html>';
    await convertHtmlToPng(testHtml);
    console.log('[Gotenberg] Connection test successful');
    return true;
  } catch (error) {
    console.error('[Gotenberg] Connection test failed:', error.message);
    return false;
  }
};

module.exports = {
  getGotenbergClient,
  convertHtmlToPng,
  convertHtmlToPdf,
  testGotenbergConnection
};
