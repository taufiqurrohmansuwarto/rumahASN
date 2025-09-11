import { uploadFileMinio } from "..";
import { getEncryptedUserId } from "./knowledge-content.services";
const BASE_URL = "https://siasn.bkd.jatimprov.go.id:9000/public";
const { nanoid } = require("nanoid");

const KnowledgeContentVersions = require("@/models/knowledge/content-versions.model");
const KnowledgeContent = require("@/models/knowledge/contents.model");

export const createInitialRevision = async (contentId) => {
  const content = await KnowledgeContent.query()
    .findById(contentId)
    .withGraphFetched("[references, attachments]");

  const revisionData = {
    content_id: contentId,
    version: 1,
    title: content.title,
    content: content.content,
    summary: content.summary,
    tags: JSON.stringify(content.tags || []),
    category_id: content.category_id,
    type: content.type,
    source_url: content.source_url,
    status: "published",
    updated_by: content.author_id,
    change_summary: "Revisi awal dibuat dari konten yang dipublikasi",
    reason: "Revisi awal dibuat dari konten yang dipublikasi",
    references: JSON.stringify(content.references || []),
    attachments: JSON.stringify(content.attachments || []),
    views_count: content.views_count,
    likes_count: content.likes_count,
    comments_count: content.comments_count,
    bookmarks_count: content.bookmarks_count,
    estimated_reading_time: content.estimated_reading_time,
    reading_complexity: content.reading_complexity,
    verified_by: content.verified_by,
    author_id: content.author_id,
  };

  const existingVersion = await KnowledgeContentVersions.query()
    .where("content_id", contentId)
    .andWhere("version", 1)
    .first();

  if (existingVersion) {
    await KnowledgeContentVersions.query()
      .where("content_id", contentId)
      .andWhere("version", 1)
      .patch(revisionData);
  } else {
    await KnowledgeContentVersions.query().insert(revisionData);
  }

  return content;
};

export const uploadContentAttachmentRevision = async (
  versionId,
  files,
  userId,
  mc
) => {
  const content = await KnowledgeContentVersions.query().findById(versionId);

  if (!content) {
    throw new Error("Revision not found");
  }

  // Verify permission (user owns content or is admin)
  if (content.author_id !== userId) {
    throw new Error("Access denied");
  }

  const uploadPromises = files.map(async (file) => {
    const encryptedUserId = getEncryptedUserId(userId);
    const fileName = `knowledge-attachments/${encryptedUserId}/${Date.now()}-${
      file.originalname
    }`;

    await uploadFileMinio(mc, file.buffer, fileName, file.size, file.mimetype);

    const result = {
      content_id: content.content_id,
      content_version_id: content.id,
      name: file.originalname,
      path: `${BASE_URL}/${fileName}`,
      size: file.size,
      mime: file.mimetype,
      url: `${BASE_URL}/${fileName}`,
    };

    return result;
  });

  const uploadResults = await Promise.all(uploadPromises);
  const results = uploadResults.map((result) => ({
    id: nanoid(),
    content_id: result.content_id,
    content_version_id: result.content_version_id,
    name: result.name,
    size: result.size,
    mime: result.mime,
    url: result.url,
  }));

  const newAttachments = [...content?.attachments, ...results];
  // Save to database
  await KnowledgeContentVersions.query()
    .patch({ attachments: JSON.stringify(newAttachments) })
    .where("id", versionId);

  return {
    message: `${uploadResults.length} file(s) uploaded successfully`,
    attachments: uploadResults,
  };
};
