const KnowledgeUserInteraction = require("@/models/knowledge/user-interactions.model");
const KnowledgeContent = require("@/models/knowledge/contents.model");
import { handleError } from "@/utils/helper/controller-helper";

export const likes = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    const currentContent = await KnowledgeContent.query()
      .where("id", id)
      .andWhere("status", "published")
      .first();

    if (!currentContent) {
      return res.status(404).json({ message: "Content tidak ditemukan" });
    }

    // Gunakan transaction untuk memastikan atomicity
    const result = await KnowledgeContent.transaction(async (trx) => {
      // Cek apakah user sudah like sebelumnya
      const existingInteraction = await KnowledgeUserInteraction.query(trx)
        .where("content_id", id)
        .andWhere("user_id", customId)
        .andWhere("interaction_type", "like")
        .first();

      if (existingInteraction) {
        // Jika sudah like, maka unlike (hapus like dan kurangi counter)
        await KnowledgeUserInteraction.query(trx)
          .where("id", existingInteraction.id)
          .delete();

        await KnowledgeContent.query(trx)
          .where("id", id)
          .decrement("likes_count", 1);

        return {
          message: "Like berhasil dihapus",
          liked: false,
          likes_count: currentContent.likes_count - 1,
        };
      } else {
        // Jika belum like, maka tambahkan like
        await KnowledgeUserInteraction.query(trx).insert({
          content_id: id,
          user_id: customId,
          interaction_type: "like",
        });

        await KnowledgeContent.query(trx)
          .where("id", id)
          .increment("likes_count", 1);

        return {
          message: "Berhasil menyukai konten",
          liked: true,
          likes_count: currentContent.likes_count + 1,
        };
      }
    });

    return res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const createComment = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;
    const { comment: commentText } = req?.body;

    // Cek apakah konten ada
    const currentContent = await KnowledgeContent.query()
      .where("id", id)
      .andWhere("status", "published")
      .first();

    if (!currentContent) {
      return res.status(404).json({
        message: "Konten tidak ditemukan",
      });
    }

    // Validasi comment tidak kosong
    if (!commentText || commentText.trim() === "") {
      return res.status(400).json({
        message: "Komentar tidak boleh kosong",
      });
    }

    const result = await KnowledgeContent.transaction(async (trx) => {
      // Tambahkan komentar
      const newComment = await KnowledgeUserInteraction.query(trx).insert({
        content_id: id,
        user_id: customId,
        interaction_type: "comment",
        comment: commentText.trim(),
      });

      // Increment comments_count
      await KnowledgeContent.query(trx)
        .where("id", id)
        .increment("comments_count", 1);

      return {
        message: "Berhasil menambahkan komentar",
        comment: newComment,
        comments_count: currentContent.comments_count + 1,
      };
    });

    return res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const removeComment = async (req, res) => {
  try {
    const { id, commentId } = req?.query;
    const { customId } = req?.user;

    // Cek apakah konten ada
    const currentContent = await KnowledgeContent.query()
      .where("id", id)
      .andWhere("status", "published")
      .first();

    if (!currentContent) {
      return res.status(404).json({
        message: "Konten tidak ditemukan",
      });
    }

    // Cek apakah komentar ada dan milik user
    const existingComment = await KnowledgeUserInteraction.query()
      .where("id", commentId)
      .andWhere("content_id", id)
      .andWhere("user_id", customId)
      .andWhere("interaction_type", "comment")
      .first();

    if (!existingComment) {
      return res.status(404).json({
        message:
          "Komentar tidak ditemukan atau Anda tidak memiliki akses untuk menghapusnya",
      });
    }

    const result = await KnowledgeContent.transaction(async (trx) => {
      // Hapus komentar
      await KnowledgeUserInteraction.query(trx).where("id", commentId).delete();

      // Decrement comments_count
      await KnowledgeContent.query(trx)
        .where("id", id)
        .decrement("comments_count", 1);

      return {
        message: "Berhasil menghapus komentar",
        comments_count: Math.max(0, currentContent.comments_count - 1),
      };
    });

    return res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const bookmark = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    // Cek apakah konten ada
    const currentContent = await KnowledgeContent.query()
      .where("id", id)
      .andWhere("status", "published")
      .first();

    if (!currentContent) {
      return res.status(404).json({
        message: "Konten tidak ditemukan",
      });
    }

    // Cek apakah sudah ada bookmark
    const existingBookmark = await KnowledgeUserInteraction.query()
      .where("content_id", id)
      .andWhere("user_id", customId)
      .andWhere("interaction_type", "bookmark")
      .first();

    const result = await KnowledgeContent.transaction(async (trx) => {
      if (existingBookmark) {
        // Hapus bookmark (unbookmark)
        await KnowledgeUserInteraction.query(trx)
          .where("id", existingBookmark.id)
          .delete();

        // Decrement bookmarks_count
        await KnowledgeContent.query(trx)
          .where("id", id)
          .decrement("bookmarks_count", 1);

        return {
          message: "Berhasil menghapus bookmark",
          is_bookmarked: false,
          bookmarks_count: Math.max(0, currentContent.bookmarks_count - 1),
        };
      } else {
        // Tambahkan bookmark
        const newBookmark = await KnowledgeUserInteraction.query(trx).insert({
          content_id: id,
          user_id: customId,
          interaction_type: "bookmark",
        });

        // Increment bookmarks_count
        await KnowledgeContent.query(trx)
          .where("id", id)
          .increment("bookmarks_count", 1);

        return {
          message: "Berhasil menambahkan bookmark",
          is_bookmarked: true,
          bookmark: newBookmark,
          bookmarks_count: currentContent.bookmarks_count + 1,
        };
      }
    });

    return res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};
