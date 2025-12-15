const Pendampingan = require("@/models/sapa-asn/sapa-asn.pendampingan.model");
const Notifikasi = require("@/models/sapa-asn/sapa-asn.notifikasi.model");
const { handleError } = require("@/utils/helper/controller-helper");
const ExcelJS = require("exceljs");
const archiver = require("archiver");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const {
  downloadFileAsBuffer,
  parseMinioUrl,
  uploadFilePublic,
  generatePublicUrl,
} = require("@/utils/helper/minio-helper");
const { nanoid } = require("nanoid");

const dayjs = require("dayjs");
require("dayjs/locale/id");
dayjs.locale("id");

// Helper function to parse JSON fields
const parseJsonField = (field) => {
  if (!field) return [];
  if (typeof field === "string") {
    try {
      return JSON.parse(field);
    } catch {
      return [];
    }
  }
  return field;
};

// Helper function to wrap text for PDF
const wrapText = (text, maxWidth, font, fontSize) => {
  if (!text) return ["-"];
  
  const textStr = String(text);
  const lines = [];
  
  // Split by newlines first
  const paragraphs = textStr.split(/\r?\n/);
  
  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push(""); // Preserve empty lines
      continue;
    }
    
    const words = paragraph.split(" ");
    let currentLine = "";

    for (const word of words) {
      if (!word) continue;
      
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // Word is too long, force add (truncate if necessary)
          lines.push(word);
          currentLine = "";
        }
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines.length > 0 ? lines : ["-"];
};

// Generate PDF summary using pdf-lib
const generatePdfSummary = async (pendampingan, jenisPerkara, bentukPendampingan, lampiran) => {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const margin = 50;
  const contentWidth = width - margin * 2;
  const labelWidth = 130;
  const valueStartX = margin + labelWidth + 15;
  const valueMaxWidth = contentWidth - labelWidth - 25;
  const lineHeight = 14;
  let yPosition = height - margin;

  // Colors
  const black = rgb(0, 0, 0);
  const gray = rgb(0.3, 0.3, 0.3);
  const lightGray = rgb(0.9, 0.9, 0.9);

  // Helper function to check if need new page
  const checkNewPage = (requiredSpace) => {
    if (yPosition - requiredSpace < margin + 30) {
      page = pdfDoc.addPage([595.28, 841.89]);
      yPosition = height - margin;
      return true;
    }
    return false;
  };

  // Helper function to draw text
  const drawText = (text, x, y, options = {}) => {
    const { font = fontRegular, size = 10, color = black } = options;
    page.drawText(String(text || ""), { x, y, size, font, color });
  };

  // Helper function to draw section title
  const drawSectionTitle = (title, y) => {
    checkNewPage(50);
    page.drawRectangle({
      x: margin,
      y: y - 5,
      width: contentWidth,
      height: 20,
      color: lightGray,
    });
    drawText(title, margin + 5, y, { font: fontBold, size: 11 });
    return y - 30;
  };

  // Helper function to draw info row with text wrapping
  const drawInfoRow = (label, value, y) => {
    const valueText = String(value || "-");
    const valueLines = wrapText(valueText, valueMaxWidth, fontRegular, 10);
    const rowHeight = Math.max(valueLines.length * lineHeight, lineHeight);
    
    checkNewPage(rowHeight + 5);
    
    // Draw label
    drawText(label, margin + 10, y, { size: 10 });
    drawText(":", margin + labelWidth, y, { size: 10 });
    
    // Draw value lines
    for (let i = 0; i < valueLines.length; i++) {
      drawText(valueLines[i], valueStartX, y - (i * lineHeight), { size: 10 });
    }
    
    return y - rowHeight - 4;
  };

  // Header
  drawText("RINGKASAN PERMOHONAN PENDAMPINGAN HUKUM", width / 2 - 170, yPosition, { font: fontBold, size: 14 });
  yPosition -= 20;
  drawText(`ID: ${pendampingan.id}`, width / 2 - 40, yPosition, { size: 11, color: gray });
  yPosition -= 10;

  // Line separator
  page.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: width - margin, y: yPosition },
    thickness: 1.5,
    color: black,
  });
  yPosition -= 30;

  // Section A: Informasi Pemohon
  yPosition = drawSectionTitle("A. INFORMASI PEMOHON", yPosition);
  yPosition = drawInfoRow("Nama", pendampingan.user?.username, yPosition);
  yPosition = drawInfoRow("NIP", pendampingan.user?.employee_number, yPosition);
  yPosition = drawInfoRow("Jabatan", pendampingan.user?.nama_jabatan, yPosition);
  yPosition = drawInfoRow("Perangkat Daerah", pendampingan.user?.perangkat_daerah_detail, yPosition);
  yPosition = drawInfoRow("No. HP", pendampingan.no_hp_user, yPosition);
  yPosition = drawInfoRow("Email", pendampingan.email_user, yPosition);
  yPosition -= 10;

  // Section B: Detail Perkara
  yPosition = drawSectionTitle("B. DETAIL PERKARA", yPosition);
  yPosition = drawInfoRow("No. Perkara", pendampingan.no_perkara, yPosition);
  yPosition = drawInfoRow("Jenis Perkara", jenisPerkara.length > 0 ? jenisPerkara.join(", ") : "-", yPosition);
  yPosition = drawInfoRow("Tempat Pengadilan", pendampingan.tempat_pengadilan, yPosition);
  yPosition = drawInfoRow("Jadwal Sidang", pendampingan.jadwal_pengadilan ? dayjs(pendampingan.jadwal_pengadilan).format("DD MMMM YYYY, HH:mm") : "-", yPosition);
  yPosition = drawInfoRow("Bentuk Pendampingan", bentukPendampingan.length > 0 ? bentukPendampingan.join(", ") : "-", yPosition);
  yPosition = drawInfoRow("Status", pendampingan.status, yPosition);
  yPosition = drawInfoRow("Tanggal Pengajuan", dayjs(pendampingan.created_at).format("DD MMMM YYYY, HH:mm"), yPosition);
  yPosition -= 10;

  // Section C: Ringkasan Pokok Perkara
  yPosition = drawSectionTitle("C. RINGKASAN POKOK PERKARA", yPosition);

  // Draw ringkasan with word wrap
  const ringkasanText = pendampingan.ringkasan_perkara || "-";
  const ringkasanLines = wrapText(ringkasanText, contentWidth - 20, fontRegular, 10);

  // Calculate height needed
  const ringkasanHeight = Math.max(ringkasanLines.length * lineHeight + 20, 50);
  checkNewPage(ringkasanHeight + 20);

  // Background for ringkasan
  page.drawRectangle({
    x: margin,
    y: yPosition - ringkasanHeight + 15,
    width: contentWidth,
    height: ringkasanHeight,
    color: rgb(0.98, 0.98, 0.98),
    borderColor: rgb(0.85, 0.85, 0.85),
    borderWidth: 0.5,
  });

  for (let i = 0; i < ringkasanLines.length; i++) {
    drawText(ringkasanLines[i], margin + 10, yPosition - (i * lineHeight), { size: 10 });
  }
  yPosition -= ringkasanHeight + 10;

  // Section D: Daftar Lampiran (if any)
  if (lampiran.length > 0) {
    yPosition = drawSectionTitle("D. DAFTAR LAMPIRAN", yPosition);
    for (let i = 0; i < lampiran.length; i++) {
      checkNewPage(20);
      // Wrap long filenames
      const filenameLines = wrapText(`${i + 1}. ${lampiran[i].name}`, contentWidth - 20, fontRegular, 10);
      for (let j = 0; j < filenameLines.length; j++) {
        drawText(filenameLines[j], margin + 10, yPosition - (j * lineHeight), { size: 10 });
      }
      yPosition -= filenameLines.length * lineHeight + 2;
    }
  }

  // Footer on last page
  const footerText = `Dicetak pada: ${dayjs().format("DD MMMM YYYY, HH:mm")}`;
  drawText(footerText, width - margin - fontRegular.widthOfTextAtSize(footerText, 9), margin, { size: 9, color: gray });

  // Save and convert Uint8Array to Buffer
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};

// Get all pendampingan hukum (admin)
const getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      jenisPerkara,
      bentuk,
      search,
      sortField = "created_at",
      sortOrder = "desc",
      startDate,
      endDate,
      sidangStartDate,
      sidangEndDate,
    } = req?.query;

    let query = Pendampingan.query().withGraphFetched("[user(simpleWithImage)]");

    // Filter by status
    if (status) {
      query = query.where("status", status);
    }

    // Filter by jenis perkara
    if (jenisPerkara) {
      query = query.whereRaw("jenis_perkara @> ?", [
        JSON.stringify([jenisPerkara]),
      ]);
    }

    // Filter by bentuk pendampingan
    if (bentuk) {
      query = query.whereRaw("bentuk_pendampingan @> ?", [
        JSON.stringify([bentuk]),
      ]);
    }

    // Filter by date range (tanggal usul/pengajuan)
    if (startDate && endDate) {
      query = query.whereBetween("created_at", [startDate, endDate]);
    }

    // Filter by jadwal sidang date range (tanggal sidang)
    if (sidangStartDate && sidangEndDate) {
      query = query.whereBetween("jadwal_pengadilan", [sidangStartDate, sidangEndDate]);
    }

    // Search
    if (search) {
      query = query.where((builder) => {
        builder
          .where("id", "ilike", `%${search}%`)
          .orWhere("no_perkara", "ilike", `%${search}%`)
          .orWhere("ringkasan_perkara", "ilike", `%${search}%`)
          .orWhere("pengadilan_jadwal", "ilike", `%${search}%`);
      });
    }

    // Sorting
    const order = sortOrder === "ascend" ? "asc" : "desc";
    query = query.orderBy(sortField, order);

    // Export to Excel if limit = -1
    if (parseInt(limit) === -1) {
      const data = await query;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Pendampingan Hukum");

      worksheet.columns = [
        { header: "No", key: "no", width: 5 },
        { header: "ID", key: "id", width: 20 },
        { header: "Nama User", key: "user_name", width: 25 },
        { header: "NIP", key: "nip", width: 20 },
        { header: "No HP", key: "no_hp", width: 15 },
        { header: "Email", key: "email", width: 25 },
        { header: "No Perkara", key: "no_perkara", width: 20 },
        { header: "Jenis Perkara", key: "jenis_perkara", width: 30 },
        { header: "Tempat Pengadilan", key: "tempat_pengadilan", width: 25 },
        { header: "Jadwal Sidang", key: "jadwal_pengadilan", width: 20 },
        { header: "Ringkasan Perkara", key: "ringkasan", width: 50 },
        { header: "Bentuk Pendampingan", key: "bentuk", width: 30 },
        { header: "Status", key: "status", width: 15 },
        { header: "Tanggal Usul", key: "created_at", width: 20 },
      ];

      data.forEach((item, idx) => {
        const jenisPerkara = typeof item.jenis_perkara === "string"
          ? JSON.parse(item.jenis_perkara || "[]").join(", ")
          : (item.jenis_perkara || []).join(", ");

        const bentukPendampingan = typeof item.bentuk_pendampingan === "string"
          ? JSON.parse(item.bentuk_pendampingan || "[]").join(", ")
          : (item.bentuk_pendampingan || []).join(", ");

        worksheet.addRow({
          no: idx + 1,
          id: item.id,
          user_name: item.user?.username || "-",
          nip: item.user?.employee_number || "-",
          no_hp: item.no_hp_user,
          email: item.email_user,
          no_perkara: item.no_perkara || "-",
          jenis_perkara: jenisPerkara,
          tempat_pengadilan: item.tempat_pengadilan || "-",
          jadwal_pengadilan: item.jadwal_pengadilan ? dayjs(item.jadwal_pengadilan).format("DD/MM/YYYY HH:mm") : "-",
          ringkasan: item.ringkasan_perkara || "-",
          bentuk: bentukPendampingan,
          status: item.status,
          created_at: dayjs(item.created_at).format("DD/MM/YYYY HH:mm"),
        });
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=pendampingan-hukum-${dayjs().format("YYYYMMDD")}.xlsx`
      );

      await workbook.xlsx.write(res);
      return res.end();
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const totalQuery = query.clone();
    const total = await totalQuery.resultSize();

    // Pagination
    const data = await query.limit(parseInt(limit)).offset(offset);

    res.json({
      data,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Get pendampingan by ID (admin)
const getById = async (req, res) => {
  try {
    const { id } = req?.query;

    const result = await Pendampingan.query()
      .findById(id)
      .withGraphFetched("[user(simpleWithImage)]");

    if (!result) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

// Update status pendampingan (admin)
const updateStatus = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { id } = req?.query;
    const mc = req?.mc;
    const { status, catatan, alasan_tolak } = req?.body;

    const pendampingan = await Pendampingan.query().findById(id);

    if (!pendampingan) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    const updateData = {
      status,
      fasilitator_id: customId,
    };

    if (catatan) {
      updateData.catatan = catatan;
    }

    if (alasan_tolak) {
      updateData.alasan_tolak = alasan_tolak;
    }

    // Handle file upload for attachment_disposisi
    if (req.file) {
      const file = req.file;
      const ext = file.originalname.split(".").pop();
      const filename = `sapa-asn/pendampingan-hukum/disposisi/${id}-${nanoid(8)}.${ext}`;
      
      await uploadFilePublic(
        mc,
        file.buffer,
        filename,
        file.size,
        file.mimetype
      );
      
      updateData.attachment_disposisi = generatePublicUrl(filename);
    }

    await Pendampingan.query().findById(id).patch(updateData);

    // Create notification for user
    let notifJudul = "";
    let notifPesan = "";

    switch (status) {
      case "Diterima":
      case "Approved":
        notifJudul = "Permohonan Pendampingan Diterima";
        notifPesan = `Permohonan pendampingan hukum Anda telah disetujui. Tim kami akan menghubungi Anda.`;
        break;
      case "Ditolak":
      case "Rejected":
        notifJudul = "Permohonan Pendampingan Ditolak";
        notifPesan = `Permohonan pendampingan hukum Anda ditolak. Alasan: ${alasan_tolak || "-"}`;
        break;
      case "In Progress":
        notifJudul = "Pendampingan Sedang Berjalan";
        notifPesan = `Proses pendampingan hukum Anda sedang berjalan.`;
        break;
      case "Completed":
        notifJudul = "Pendampingan Hukum Selesai";
        notifPesan = `Proses pendampingan hukum Anda telah selesai. Terima kasih telah menggunakan layanan kami.`;
        break;
      default:
        notifJudul = "Status Pendampingan Diperbarui";
        notifPesan = `Status permohonan pendampingan hukum Anda telah diperbarui menjadi: ${status}`;
    }

    await Notifikasi.query().insert({
      user_id: pendampingan.user_id,
      judul: notifJudul,
      pesan: notifPesan,
      layanan: "pendampingan_hukum",
      reference_id: id,
    });

    res.json({ message: "Status berhasil diperbarui" });
  } catch (error) {
    handleError(res, error);
  }
};

// Download pendampingan as PDF or ZIP (if has attachments)
const downloadPendampingan = async (req, res) => {
  try {
    const { id } = req?.query;
    const mc = req?.mc;

    const pendampingan = await Pendampingan.query()
      .findById(id)
      .withGraphFetched("[user(simpleWithImage)]");

    if (!pendampingan) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    const jenisPerkara = parseJsonField(pendampingan.jenis_perkara);
    const bentukPendampingan = parseJsonField(pendampingan.bentuk_pendampingan);
    const lampiran = parseJsonField(pendampingan.lampiran_dokumen);

    // Generate PDF using pdf-lib
    const pdfBuffer = await generatePdfSummary(
      pendampingan,
      jenisPerkara,
      bentukPendampingan,
      lampiran
    );

    // If no attachments, return PDF directly
    if (lampiran.length === 0) {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Length", pdfBuffer.length);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="ringkasan-${pendampingan.id}.pdf"`
      );
      return res.end(pdfBuffer);
    }

    // If has attachments, create ZIP
    const archive = archiver("zip", { zlib: { level: 9 } });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="pendampingan-${pendampingan.id}.zip"`
    );

    archive.on("warning", (err) => console.warn("Archive warning:", err));
    archive.on("error", (err) => {
      console.error("Archive error:", err);
      res.status(500).send({ error: err.message });
    });

    archive.pipe(res);

    // Add PDF to archive (ensure it's a Buffer)
    archive.append(Buffer.from(pdfBuffer), { name: `ringkasan-${pendampingan.id}.pdf` });

    // Add attachment files to archive
    for (const file of lampiran) {
      try {
        console.log(`[Download] Processing attachment: ${file.name}`);
        console.log(`[Download] File URL: ${file.url}`);
        console.log(`[Download] File path: ${file.path}`);

        // Try using file.path first (direct path), fallback to URL parsing
        let bucket = "public";
        let filePath = file.path;

        if (!filePath && file.url) {
          const urlInfo = parseMinioUrl(file.url);
          if (urlInfo) {
            bucket = urlInfo.bucket;
            filePath = urlInfo.filename;
          }
        }

        if (filePath) {
          console.log(`[Download] Downloading from bucket: ${bucket}, path: ${filePath}`);
          const fileBuffer = await downloadFileAsBuffer(mc, bucket, filePath);
          console.log(`[Download] Downloaded ${file.name}, size: ${fileBuffer.length} bytes`);
          archive.append(fileBuffer, { name: `lampiran/${file.name}` });
          console.log(`[Download] Added ${file.name} to archive`);
        } else {
          console.error(`[Download] No valid path found for: ${file.name}`);
        }
      } catch (err) {
        console.error(`[Download] Failed to download attachment: ${file.name}`, err.message || err);
        // Continue with other files
      }
    }

    console.log(`[Download] Finalizing archive...`);
    await archive.finalize();
    console.log(`[Download] Archive finalized`);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getAll,
  getById,
  updateStatus,
  downloadPendampingan,
};

