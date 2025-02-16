const Letter = require("@/models/signify/letters.model");
const DocumentVersion = require("@/models/signify/document-versions.model");
const LetterWorkflow = require("@/models/signify/letter-workflow.model");
const AuditLog = require("@/models/signify/audit-log.model");
const Notification = require("@/models/signify/notifications.model");

const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Tambahkan entri audit log
async function addAuditLog(letterId, action, performedBy, description) {
  await AuditLog.query().insert({
    letter_id: letterId,
    action,
    performed_by: performedBy,
    description,
  });
}

// Buat notifikasi untuk user
async function createNotification(userId, letterId, message) {
  await Notification.query().insert({
    user_id: userId,
    letter_id: letterId,
    message,
  });
}

// Dummy helper untuk menentukan user eskalasi (misalnya supervisor)
// Sesuaikan logika ini dengan struktur organisasi Anda.
async function getEscalationUser(userId) {
  // Contoh sederhana: Supervisor dianggap memiliki ID = userId + 1
  return userId + 1;
}

// --- Controller Object ---

export const LetterController = {
  /**
   * uploadFile
   * [POST] /api/uploadFile?
   * Hanya untuk mengupload file ke Minio dan mengembalikan URL-nya.
   */
  uploadFile: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file provided." });
      }
      const bucketName = process.env.MINIO_BUCKET;
      const fileName = Date.now() + "_" + req.file.originalname;
      await new Promise((resolve, reject) => {
        minioClient.fPutObject(
          bucketName,
          fileName,
          req.file.path,
          {},
          (err, etag) => {
            if (err) return reject(err);
            resolve(etag);
          }
        );
      });
      const fileUrl = `${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucketName}/${fileName}`;
      res.json({ message: "File uploaded successfully", fileUrl });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * createLetter
   * [POST] /api/letters?
   * Membuat entri surat baru (hanya metadata dan workflow).
   * File dokumen diupload secara terpisah melalui endpoint uploadFile.
   */
  createLetter: async (req, res) => {
    try {
      const { title, description, workflow } = req.body;
      const submitted_by = req.user.id;
      const letter = await Letter.query().insert({
        title,
        description,
        submitted_by,
        current_status: "submitted",
      });
      // Entri workflow awal: submission oleh staff (step 1)
      await LetterWorkflow.query().insert({
        letter_id: letter.id,
        step_order: 1,
        role: "staff",
        assigned_to: submitted_by,
        status: "submitted",
      });
      // Entri workflow tambahan untuk reviewer/signer
      if (workflow && Array.isArray(workflow)) {
        for (const step of workflow) {
          const { step_order, role, assigned_to, deadline } = step;
          await LetterWorkflow.query().insert({
            letter_id: letter.id,
            step_order,
            role,
            assigned_to,
            status: "pending",
            deadline: deadline || null,
          });
          await createNotification(
            assigned_to,
            letter.id,
            `You are assigned as ${role} for letter "${title}".`
          );
        }
      }
      await addAuditLog(
        letter.id,
        "submitted",
        submitted_by,
        "Letter created and submitted by staff."
      );
      res
        .status(201)
        .json({ message: "Letter created successfully", letter_id: letter.id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * updateLetter
   * [PUT] /api/letters?letterId=...
   * Memperbarui data surat dan (opsional) menambahkan versi dokumen baru jika file diupload.
   * Mendukung tipe file (pdf/word) melalui parameter fileType.
   */
  updateLetter: async (req, res) => {
    try {
      const { letterId } = req?.query;
      const { title, description } = req.body;
      const fileType = req.body.fileType || "pdf";
      let newVersion = null;
      if (req.file) {
        const letter = await Letter.query().findById(letterId);
        if (!letter)
          return res.status(404).json({ error: "Letter not found." });
        newVersion = letter.current_version + 1;
        const bucketName = process.env.MINIO_BUCKET;
        const fileName = Date.now() + "_" + req.file.originalname;
        await new Promise((resolve, reject) => {
          minioClient.fPutObject(
            bucketName,
            fileName,
            req.file.path,
            {},
            (err, etag) => {
              if (err) return reject(err);
              resolve(etag);
            }
          );
        });
        const filePath = `${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucketName}/${fileName}`;
        await DocumentVersion.query().insert({
          letter_id: letterId,
          version_number: newVersion,
          file_path: filePath,
          status: "draft",
          file_type: fileType,
        });
        await Letter.query()
          .patch({ current_version: newVersion })
          .findById(letterId);
      }
      await Letter.query()
        .patch({ title, description, updated_at: new Date() })
        .findById(letterId);
      await addAuditLog(
        letterId,
        "edited",
        req.user.id,
        "Letter updated (revised) by staff."
      );
      res.json({
        message: "Letter updated successfully",
        new_version: newVersion,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * convertWordToPdf
   * [PUT] /api/letters/convert?letterId=...&documentVersionId=...
   * Mengonversi dokumen Word menjadi PDF menggunakan Gutenberg API.
   */
  convertWordToPdf: async (req, res) => {
    try {
      const { letterId, documentVersionId } = req?.query;
      const docVersion = await DocumentVersion.query().findById(
        documentVersionId
      );
      if (!docVersion) {
        return res.status(404).json({ error: "Document version not found." });
      }
      if (docVersion.file_type !== "word") {
        return res.status(400).json({ error: "Document is not a Word file." });
      }
      const fileBuffer = fs.readFileSync(path.resolve(docVersion.file_path));
      const base64File = fileBuffer.toString("base64");

      // Panggil Gutenberg API untuk konversi (URL dari env: GUTENBERG_API_URL)
      const response = await axios.post(process.env.GUTENBERG_API_URL, {
        file: base64File,
      });
      const { pdfBase64 } = response.data;
      if (!pdfBase64) {
        return res
          .status(500)
          .json({ error: "Conversion failed: no PDF returned." });
      }
      const letter = await Letter.query().findById(letterId);
      const newVersion = letter.current_version + 1;
      const pdfFileName = `converted_${Date.now()}_${letterId}.pdf`;
      const pdfFilePath = path.resolve("converted_documents", pdfFileName);
      fs.writeFileSync(pdfFilePath, Buffer.from(pdfBase64, "base64"));
      await DocumentVersion.query().insert({
        letter_id: letterId,
        version_number: newVersion,
        file_path: pdfFilePath,
        status: "converted",
        file_type: "pdf",
      });
      await Letter.query()
        .patch({ current_version: newVersion })
        .findById(letterId);
      await addAuditLog(
        letterId,
        "converted",
        req.user.id,
        "Document converted from Word to PDF."
      );
      res.json({
        message: "Document converted to PDF successfully",
        new_version: newVersion,
        pdfFilePath,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * approveLetter
   * [PUT] /api/letters/approve?letterId=...
   * Memproses approval oleh reviewer atau signer.
   * Jika role reviewer: hanya update status.
   * Jika role signer: validasi passphrase, kemudian lakukan digital signature untuk membuat versi dokumen baru.
   * Jika tidak ada langkah selanjutnya, status surat diubah menjadi "completed".
   */
  approveLetter: async (req, res) => {
    try {
      const { letterId } = req?.query;
      const { comments, passphrase } = req.body;
      const userId = req.user.id;
      const workflowEntry = await LetterWorkflow.query()
        .findOne({ letter_id: letterId, status: "pending" })
        .where("assigned_to", userId);
      if (!workflowEntry) {
        return res
          .status(403)
          .json({ error: "Unauthorized to approve this letter." });
      }
      // Jika role adalah signer, validasi passphrase
      if (workflowEntry.role === "signer") {
        if (!passphrase) {
          return res
            .status(400)
            .json({ error: "Passphrase is required for signing." });
        }
        const valid = null;
        if (!valid) {
          return res.status(403).json({ error: "Invalid passphrase." });
        }
      }
      // Update entry workflow menjadi approved
      await LetterWorkflow.query()
        .patch({
          status: "approved",
          comments,
          signed_at: new Date(),
        })
        .findById(workflowEntry.id);
      await addAuditLog(
        letterId,
        "approved",
        userId,
        `Letter approved at step ${workflowEntry.step_order}`
      );
      // Jika role adalah signer, lakukan digital signature
      if (workflowEntry.role === "signer") {
        const latestVersion = await DocumentVersion.query()
          .where("letter_id", letterId)
          .orderBy("version_number", "desc")
          .first();
        if (!latestVersion) {
          return res.status(404).json({ error: "No document found to sign." });
        }
        const fileBuffer = fs.readFileSync(
          path.resolve(latestVersion.file_path)
        );
        const base64File = fileBuffer.toString("base64");
        const signedBase64 = await signDocument(base64File);
        const letter = await Letter.query().findById(letterId);
        const newVersion = letter.current_version + 1;
        const signedFileName = `signed_${Date.now()}_${letterId}.pdf`;
        const signedFilePath = path.resolve("signed_documents", signedFileName);
        fs.writeFileSync(signedFilePath, Buffer.from(signedBase64, "base64"));
        await DocumentVersion.query().insert({
          letter_id: letterId,
          version_number: newVersion,
          file_path: signedFilePath,
          status: "signed",
          file_type: "pdf",
        });
        await Letter.query()
          .patch({ current_version: newVersion })
          .findById(letterId);
      }
      // Cek langkah workflow selanjutnya
      const nextStep = await LetterWorkflow.query()
        .where("letter_id", letterId)
        .andWhere("step_order", ">", workflowEntry.step_order)
        .orderBy("step_order", "asc")
        .first();
      if (nextStep) {
        await Letter.query()
          .patch({
            current_step: nextStep.step_order,
            current_status: "in_review",
          })
          .findById(letterId);
        await createNotification(
          nextStep.assigned_to,
          letterId,
          `You have a new approval task for letter at step ${nextStep.step_order}.`
        );
        return res.json({
          message: "Letter approved. Proceed to next step.",
          next_step: nextStep.step_order,
        });
      } else {
        await Letter.query()
          .patch({ current_status: "completed" })
          .findById(letterId);
        return res.json({ message: "Letter approved and completed." });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * rejectLetter
   * [PUT] /api/letters/reject?letterId=...
   * Memproses penolakan surat oleh reviewer/signer.
   * Parameter "rejectAction" (dalam req.body) menentukan:
   * - "revise": reject untuk diperbaiki (melanjutkan ke workflow perbaikan)
   * - "terminate": reject dan mengakhiri seluruh proses
   * Jika "revise", opsional parameter "reworkAssignee" menentukan siapa yang menangani perbaikan.
   */
  rejectLetter: async (req, res) => {
    try {
      const { letterId } = req?.query;
      const { comments, rejectAction, reworkAssignee } = req.body;
      const userId = req.user.id;
      const workflowEntry = await LetterWorkflow.query().findOne({
        letter_id: letterId,
        assigned_to: userId,
        status: "pending",
      });
      if (!workflowEntry) {
        return res
          .status(403)
          .json({ error: "Unauthorized to reject this letter." });
      }
      // Update entry workflow menjadi rejected
      await LetterWorkflow.query()
        .patch({ status: "rejected", comments })
        .findById(workflowEntry.id);
      await addAuditLog(
        letterId,
        "rejected",
        userId,
        `Letter rejected at step ${workflowEntry.step_order}`
      );
      // Jika rejectAction adalah "terminate", akhiri proses
      if (rejectAction === "terminate") {
        await Letter.query()
          .patch({ current_status: "terminated" })
          .findById(letterId);
        return res.json({ message: "Letter rejected and process terminated." });
      } else {
        // Jika "revise", tetapkan workflow untuk perbaikan.
        const letter = await Letter.query().findById(letterId);
        const reworkTarget = reworkAssignee || letter.submitted_by;
        await Letter.query()
          .patch({ current_status: "in_revision", current_step: 1 })
          .findById(letterId);
        await LetterWorkflow.query().insert({
          letter_id: letterId,
          step_order: 1,
          role: "staff",
          assigned_to: reworkTarget,
          status: "pending",
        });
        await createNotification(
          reworkTarget,
          letterId,
          "Your letter has been rejected. Please revise."
        );
        return res.json({
          message: "Letter rejected and sent back for revision.",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * reassignWorkflow
   * [PUT] /api/letters/reassign?letterId=...&workflowId=...
   * Memproses reassign workflow jika user yang ter-assign tidak tersedia.
   */
  reassignWorkflow: async (req, res) => {
    try {
      const { letterId, workflowId } = req?.query;
      const { newAssignedTo } = req.body;
      const workflowEntry = await LetterWorkflow.query().findById(workflowId);
      if (!workflowEntry) {
        return res.status(404).json({ error: "Workflow entry not found." });
      }
      await LetterWorkflow.query()
        .patch({
          reassigned_from: workflowEntry.assigned_to,
          assigned_to: newAssignedTo,
          updated_at: new Date(),
        })
        .findById(workflowId);
      await addAuditLog(
        letterId,
        "reassigned",
        workflowEntry.assigned_to,
        `Workflow reassigned to user ${newAssignedTo}`
      );
      await createNotification(
        newAssignedTo,
        letterId,
        `You have been reassigned for letter #${letterId}.`
      );
      res.json({ message: `Workflow reassigned to user ${newAssignedTo}.` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * processEscalation
   * [POST] /api/letters/escalate?
   * Memproses eskalasi otomatis untuk entry workflow yang pending dan melewati deadline.
   * Hanya mengeskalasi entry yang merupakan bagian dari step aktif (letter.current_step) dan belum di-eskalasi.
   * Biasanya dijalankan sebagai cron job.
   */
  processEscalation: async (req, res) => {
    try {
      const overdueEntries = await LetterWorkflow.query()
        .where("status", "pending")
        .andWhere("deadline", "<", new Date())
        .andWhere("escalated_to", null);
      for (const entry of overdueEntries) {
        const letter = await Letter.query().findById(entry.letter_id);
        if (letter.current_step !== entry.step_order) continue;
        const escalatedTo = await getEscalationUser(entry.assigned_to);
        if (!escalatedTo) continue;
        await LetterWorkflow.query()
          .patch({ escalated_to: escalatedTo })
          .findById(entry.id);
        await createNotification(
          escalatedTo,
          entry.letter_id,
          `Escalation: Letter #${entry.letter_id} requires your attention.`
        );
        await addAuditLog(
          entry.letter_id,
          "escalated",
          entry.assigned_to,
          `Workflow escalated to user ${escalatedTo}`
        );
      }
      res.json({ message: "Escalation process completed." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * getMyLetters
   * [GET] /api/letters/my?
   * Mengambil daftar surat yang melibatkan user (baik sebagai pengaju maupun sebagai reviewer/signer).
   */
  getMyLetters: async (req, res) => {
    try {
      const userId = req.user.id;
      // Cari surat di mana user adalah pengaju
      const submittedLetters = await Letter.query().where(
        "submitted_by",
        userId
      );
      // Cari surat di mana user terlibat di workflow
      const workflowLetters = await Letter.query()
        .joinRelated("letterWorkflows")
        .where("letterWorkflows.assigned_to", userId)
        .select("letters.*")
        .distinct();
      // Gabungkan hasil tanpa duplikasi
      const lettersMap = new Map();
      submittedLetters.forEach((letter) => lettersMap.set(letter.id, letter));
      workflowLetters.forEach((letter) => lettersMap.set(letter.id, letter));
      const letters = Array.from(lettersMap.values());
      res.json({ letters });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * addComment
   * [POST] /api/comments?
   * Menambahkan komentar pada surat.
   * Parameter opsional: workflowId untuk mengaitkan komentar pada step tertentu.
   */
  addComment: async (req, res) => {
    try {
      const { letterId, workflowId } = req?.query;
      const { comment } = req.body;
      if (!letterId || !comment) {
        return res
          .status(400)
          .json({ error: "letterId and comment are required." });
      }
      const commentedBy = req.user.id;
      const newComment = await Comment.query().insert({
        letter_id: letterId,
        workflow_id: workflowId || null,
        commented_by: commentedBy,
        comment,
      });
      await addAuditLog(
        letterId,
        "commented",
        commentedBy,
        `Comment added: ${comment}`
      );
      res
        .status(201)
        .json({ message: "Comment added successfully.", comment: newComment });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * getComments
   * [GET] /api/comments?letterId=...&workflowId=...
   * Mengambil daftar komentar untuk surat, dengan opsi filter berdasarkan workflowId.
   */
  getComments: async (req, res) => {
    try {
      const { letterId, workflowId } = req?.query;
      if (!letterId) {
        return res.status(400).json({ error: "letterId is required." });
      }
      let query = Comment.query().where("letter_id", letterId);
      if (workflowId) {
        query = query.andWhere("workflow_id", workflowId);
      }
      const comments = await query.orderBy("created_at", "asc");
      res.json({ comments });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
};
