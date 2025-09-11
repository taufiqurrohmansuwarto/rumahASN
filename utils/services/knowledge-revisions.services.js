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
