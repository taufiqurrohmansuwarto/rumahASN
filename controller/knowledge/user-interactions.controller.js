const KnowledgeUserInteraction = require("@/models/knowledge/user-interactions.model");
const KnowledgeContent = require("@/models/knowledge/contents.model");
import { handleError } from "@/utils/helper/controller-helper";
import { awardXP } from "./gamification.controller";

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

        // Award XP untuk user yang like (+2 XP, atau +1 XP jika konten sendiri)
        const isSelfAction = currentContent.author_id === customId;
        try {
          await awardXP({
            userId: customId,
            action: "like_content",
            refType: "content",
            refId: id,
            xp: 2,
            isSelfAction,
          });
        } catch (xpError) {
          console.warn("Failed to award XP for like:", xpError);
        }

        // Award XP untuk author konten (+1 XP) - skip jika like konten sendiri
        if (!isSelfAction) {
          try {
            await awardXP({
              userId: currentContent.author_id,
              action: "content_liked",
              refType: "content",
              // Make it unique per liker per content to prevent farming
              refId: `${id}:${customId}`,
              xp: 1,
            });
          } catch (xpError) {
            console.warn("Failed to award XP to author:", xpError);
          }
        }

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
        comment_text: commentText.trim(),
        parent_comment_id: null,
        depth: 0,
        replies_count: 0,
        likes_count: 0,
        is_pinned: false,
        is_edited: false,
      });

      // Increment comments_count
      await KnowledgeContent.query(trx)
        .where("id", id)
        .increment("comments_count", 1);

      // Award XP untuk user yang comment (+3 XP, atau +1.5 XP jika konten sendiri)
      const isSelfAction = currentContent.author_id === customId;
      try {
        await awardXP({
          userId: customId,
          action: "comment_content",
          refType: "content",
          refId: id,
          xp: 3,
          isSelfAction,
        });
      } catch (xpError) {
        console.warn("Failed to award XP for comment:", xpError);
      }

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
      // Helper function untuk hapus replies secara rekursif
      const deleteReplies = async (parentId) => {
        // Ambil semua replies dari parent comment
        const replies = await KnowledgeUserInteraction.query(trx)
          .where("parent_comment_id", parentId)
          .andWhere("interaction_type", "comment");

        let totalDeleted = 0;

        for (const reply of replies) {
          // Recursively delete child replies
          const childrenDeleted = await deleteReplies(reply.id);
          totalDeleted += childrenDeleted;

          // Delete likes for this reply
          await KnowledgeUserInteraction.query(trx)
            .where("parent_comment_id", reply.id)
            .andWhere("interaction_type", "comment_like")
            .delete();

          // Delete the reply itself
          await KnowledgeUserInteraction.query(trx)
            .where("id", reply.id)
            .delete();

          totalDeleted++;
        }

        return totalDeleted;
      };

      // Hapus semua replies dari comment ini
      const deletedRepliesCount = await deleteReplies(commentId);

      // Hapus semua likes untuk comment ini
      await KnowledgeUserInteraction.query(trx)
        .where("parent_comment_id", commentId)
        .andWhere("interaction_type", "comment_like")
        .delete();

      // Hapus komentar utama
      await KnowledgeUserInteraction.query(trx).where("id", commentId).delete();

      // Update parent comment's replies_count jika ini adalah reply
      if (existingComment.parent_comment_id) {
        await KnowledgeUserInteraction.query(trx)
          .where("id", existingComment.parent_comment_id)
          .decrement("replies_count", 1);
      }

      // Decrement total comments_count (comment + replies)
      const totalDeleted = deletedRepliesCount + 1;
      await KnowledgeContent.query(trx)
        .where("id", id)
        .decrement("comments_count", totalDeleted);

      return {
        message: "Berhasil menghapus komentar dan balasan",
        comments_count: Math.max(
          0,
          currentContent.comments_count - totalDeleted
        ),
        deleted_count: totalDeleted,
      };
    });

    return res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateComment = async (req, res) => {
  try {
    const { id, commentId } = req?.query;
    const { customId } = req?.user;
    const { comment: commentText } = req?.body;

    // Validasi comment text tidak kosong
    if (!commentText || commentText.trim() === "") {
      return res.status(400).json({
        message: "Komentar tidak boleh kosong",
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
          "Komentar tidak ditemukan atau Anda tidak memiliki akses untuk mengeditnya",
      });
    }

    // Cek apakah ada perubahan text
    if (existingComment.comment_text === commentText.trim()) {
      return res.status(400).json({
        message: "Tidak ada perubahan pada komentar",
      });
    }

    const result = await KnowledgeContent.transaction(async (trx) => {
      // Update komentar dengan flag edited
      const updatedComment = await KnowledgeUserInteraction.query(trx)
        .where("id", commentId)
        .update({
          comment_text: commentText.trim(),
          is_edited: true,
          edited_at: new Date(),
          updated_at: new Date(),
        })
        .returning("*")
        .first();

      return {
        message: "Berhasil mengedit komentar",
        comment: updatedComment,
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

export const getComments = async (req, res) => {
  try {
    const { id } = req?.query;

    const comments = await KnowledgeUserInteraction.query()
      .where("content_id", id)
      .andWhere("interaction_type", "comment")
      .orderBy("created_at", "desc")
      .withGraphFetched("user(simpleWithImage)");

    return res.json(comments);
  } catch (error) {
    handleError(res, error);
  }
};

// Fungsi untuk mendapatkan komentar dengan struktur hierarkis
export const getCommentsHierarchical = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    // Helper function untuk mendapatkan replies secara rekursif
    const getReplies = async (parentId, currentDepth = 1) => {
      const replies = await KnowledgeUserInteraction.query()
        .where("parent_comment_id", parentId)
        .andWhere("interaction_type", "comment")
        .orderBy("created_at", "desc")
        .withGraphFetched("user(simpleWithImage)");

      for (let reply of replies) {
        // Cek apakah user sudah like reply ini
        if (customId) {
          const userLiked = await KnowledgeUserInteraction.query()
            .where("parent_comment_id", reply.id)
            .andWhere("user_id", customId)
            .andWhere("interaction_type", "comment_like")
            .first();
          reply.user_liked = !!userLiked;
        }

        // Ambil nested replies jika ada (maksimal depth 2 level seperti YouTube)
        if (currentDepth < 2) {
          reply.replies = await getReplies(reply.id, currentDepth + 1);
        } else {
          reply.replies = [];
        }
      }

      return replies;
    };

    // Ambil parent comments (depth = 0 atau parent_comment_id = null)
    const parentComments = await KnowledgeUserInteraction.query()
      .where("content_id", id)
      .andWhere("interaction_type", "comment")
      .where(function () {
        this.whereNull("parent_comment_id").orWhere("depth", 0);
      })
      .orderBy([
        { column: "is_pinned", order: "desc" }, // Pinned comments first
        { column: "created_at", order: "desc" },
      ])
      .withGraphFetched("user(simpleWithImage)");

    // Untuk setiap parent comment, ambil replies dan cek user likes
    for (let comment of parentComments) {
      // Cek apakah user sudah like comment ini
      if (customId) {
        const userLiked = await KnowledgeUserInteraction.query()
          .where("parent_comment_id", comment.id)
          .andWhere("user_id", customId)
          .andWhere("interaction_type", "comment_like")
          .first();
        comment.user_liked = !!userLiked;
      }

      // Don't load replies by default for better performance
      // Replies will be loaded on-demand when user expands
      comment.replies = [];
    }

    return res.json(parentComments);
  } catch (error) {
    handleError(res, error);
  }
};

// Fungsi untuk membuat reply/balasan komentar
export const createReply = async (req, res) => {
  try {
    const { id, commentId } = req?.query; // content_id dan parentCommentId
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

    // Cek apakah parent comment ada
    const parentComment = await KnowledgeUserInteraction.query()
      .where("id", commentId)
      .andWhere("content_id", id)
      .andWhere("interaction_type", "comment")
      .first();

    if (!parentComment) {
      return res.status(404).json({
        message: "Komentar induk tidak ditemukan",
      });
    }

    // Validasi reply text tidak kosong
    if (!commentText || commentText.trim() === "") {
      return res.status(400).json({
        message: "Balasan tidak boleh kosong",
      });
    }

    // Cek depth maksimal (maksimal 2 level seperti YouTube)
    if (parentComment.depth >= 1) {
      return res.status(400).json({
        message: "Maksimal kedalaman balasan sudah tercapai",
      });
    }

    const result = await KnowledgeContent.transaction(async (trx) => {
      // Buat reply baru
      const newReply = await KnowledgeUserInteraction.query(trx).insert({
        content_id: id,
        user_id: customId,
        interaction_type: "comment",
        comment_text: commentText.trim(),
        parent_comment_id: commentId,
        depth: parentComment.depth + 1,
        replies_count: 0,
        likes_count: 0,
        is_pinned: false,
        is_edited: false,
      });

      // Update replies_count pada parent comment
      await KnowledgeUserInteraction.query(trx)
        .where("id", commentId)
        .increment("replies_count", 1);

      // Increment total comments_count pada konten
      await KnowledgeContent.query(trx)
        .where("id", id)
        .increment("comments_count", 1);

      // Award XP untuk user yang reply (+2 XP, atau +1 XP jika konten sendiri)
      const isSelfAction = currentContent.author_id === customId;
      try {
        await awardXP({
          userId: customId,
          action: "reply_comment",
          refType: "comment",
          refId: commentId,
          xp: 2,
          isSelfAction,
        });
      } catch (xpError) {
        console.warn("Failed to award XP for reply:", xpError);
      }

      // Award XP untuk author parent comment (+1 XP) - skip jika reply ke komentar sendiri
      if (parentComment.user_id !== customId) {
        try {
          await awardXP({
            userId: parentComment.user_id,
            action: "comment_replied",
            refType: "comment",
            refId: `${commentId}:${customId}`,
            xp: 1,
          });
        } catch (xpError) {
          console.warn("Failed to award XP to parent comment author:", xpError);
        }
      }

      return {
        message: "Berhasil menambahkan balasan",
        reply: newReply,
        comments_count: currentContent.comments_count + 1,
        parent_replies_count: parentComment.replies_count + 1,
      };
    });

    return res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

// Fungsi untuk like/unlike komentar
export const likeComment = async (req, res) => {
  try {
    const { id, commentId } = req?.query; // content_id dan comment ID
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

    // Cek apakah comment ada
    const currentComment = await KnowledgeUserInteraction.query()
      .where("id", commentId)
      .andWhere("content_id", id)
      .andWhere("interaction_type", "comment")
      .first();

    if (!currentComment) {
      return res.status(404).json({
        message: "Komentar tidak ditemukan",
      });
    }

    const result = await KnowledgeContent.transaction(async (trx) => {
      // Cek apakah user sudah like comment ini sebelumnya
      const existingLike = await KnowledgeUserInteraction.query(trx)
        .where("parent_comment_id", commentId)
        .andWhere("user_id", customId)
        .andWhere("interaction_type", "comment_like")
        .first();

      if (existingLike) {
        // Jika sudah like, maka unlike (hapus like dan kurangi counter)
        await KnowledgeUserInteraction.query(trx)
          .where("id", existingLike.id)
          .delete();

        // Decrement likes_count pada comment
        await KnowledgeUserInteraction.query(trx)
          .where("id", commentId)
          .decrement("likes_count", 1);

        return {
          message: "Like komentar berhasil dihapus",
          liked: false,
          likes_count: Math.max(0, currentComment.likes_count - 1),
        };
      } else {
        // Jika belum like, maka tambahkan like
        await KnowledgeUserInteraction.query(trx).insert({
          content_id: id,
          user_id: customId,
          interaction_type: "comment_like",
          parent_comment_id: commentId,
        });

        // Increment likes_count pada comment
        await KnowledgeUserInteraction.query(trx)
          .where("id", commentId)
          .increment("likes_count", 1);

        // Award XP untuk user yang like comment (+1 XP)
        const isSelfAction = currentComment.user_id === customId;
        try {
          await awardXP({
            userId: customId,
            action: "like_comment",
            refType: "comment",
            refId: commentId,
            xp: 1,
            isSelfAction,
          });
        } catch (xpError) {
          console.warn("Failed to award XP for comment like:", xpError);
        }

        // Award XP untuk author comment (+0.5 XP) - skip jika like komentar sendiri
        if (!isSelfAction) {
          try {
            await awardXP({
              userId: currentComment.user_id,
              action: "comment_liked",
              refType: "comment",
              refId: `${commentId}:${customId}`,
              xp: 0.5,
            });
          } catch (xpError) {
            console.warn("Failed to award XP to comment author:", xpError);
          }
        }

        return {
          message: "Berhasil menyukai komentar",
          liked: true,
          likes_count: currentComment.likes_count + 1,
        };
      }
    });

    return res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

// Fungsi untuk pin/unpin komentar (hanya author konten atau admin)
export const pinComment = async (req, res) => {
  try {
    const { id, commentId } = req?.query; // content_id dan comment ID
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

    // Cek apakah comment ada
    const currentComment = await KnowledgeUserInteraction.query()
      .where("id", commentId)
      .andWhere("content_id", id)
      .andWhere("interaction_type", "comment")
      .first();

    if (!currentComment) {
      return res.status(404).json({
        message: "Komentar tidak ditemukan",
      });
    }

    // Cek apakah user adalah author konten (atau admin)
    if (currentContent.author_id !== customId) {
      return res.status(403).json({
        message: "Hanya penulis konten yang dapat pin/unpin komentar",
      });
    }

    const result = await KnowledgeContent.transaction(async (trx) => {
      const newPinnedStatus = !currentComment.is_pinned;

      // Update pin status
      await KnowledgeUserInteraction.query(trx).where("id", commentId).update({
        is_pinned: newPinnedStatus,
        updated_at: new Date(),
      });

      return {
        message: newPinnedStatus
          ? "Berhasil pin komentar"
          : "Berhasil unpin komentar",
        is_pinned: newPinnedStatus,
        comment_id: commentId,
      };
    });

    return res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

// Fungsi untuk mendapatkan replies untuk comment tertentu
export const getRepliesForComment = async (req, res) => {
  try {
    const { id, commentId } = req?.query; // content_id dan parent comment id
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

    // Cek apakah parent comment ada
    const parentComment = await KnowledgeUserInteraction.query()
      .where("id", commentId)
      .andWhere("content_id", id)
      .andWhere("interaction_type", "comment")
      .first();

    if (!parentComment) {
      return res.status(404).json({
        message: "Komentar tidak ditemukan",
      });
    }

    // Ambil replies untuk comment ini
    const replies = await KnowledgeUserInteraction.query()
      .where("parent_comment_id", commentId)
      .andWhere("interaction_type", "comment")
      .orderBy("created_at", "desc")
      .withGraphFetched("user(simpleWithImage)");

    // Untuk setiap reply, cek apakah user sudah like
    for (let reply of replies) {
      if (customId) {
        const userLiked = await KnowledgeUserInteraction.query()
          .where("parent_comment_id", reply.id)
          .andWhere("user_id", customId)
          .andWhere("interaction_type", "comment_like")
          .first();
        reply.user_liked = !!userLiked;
      }
      
      // Level 2 replies tidak ditampilkan untuk simplicity
      reply.replies = [];
    }

    return res.json(replies);
  } catch (error) {
    handleError(res, error);
  }
};
