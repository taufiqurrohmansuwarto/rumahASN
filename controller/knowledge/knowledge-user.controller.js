import { handleError } from "@/utils/helper/controller-helper";
import {
  getUserKnowledgeContentById,
  getUserContentsWithStats,
  getUserKnowledgeStats as getKnowledgeStatsService,
  submitContentForReview,
  editUserContent,
  deleteUserContent,
} from "@/utils/services/knowledge-user.services";

// Get user knowledge content
export const getUserKnowledgeContent = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    // Use service to get user content by ID
    const content = await getUserKnowledgeContentById(id, customId);

    if (!content) {
      return res.status(404).json({
        message: "Konten tidak ditemukan",
      });
    }

    res.json(content);
  } catch (error) {
    handleError(res, error);
  }
};

export const getUserKnowledgeContents = async (req, res) => {
  try {
    const { customId } = req?.user;
    const filters = {
      ...req.query,
      tag: req.query.tag, // Preserve original tag parameter structure
    };

    // Use service to get user contents with full statistics
    const data = await getUserContentsWithStats(customId, filters);

    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

// Get user content statistics (status counts and engagement stats)
export const getUserKnowledgeStats = async (req, res) => {
  try {
    const { customId } = req?.user;

    // Use service to get comprehensive statistics
    const data = await getKnowledgeStatsService(customId);

    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const submitMyContentForReview = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    // Use service to submit content for review
    await submitContentForReview(id, customId);

    res.json({
      success: true,
      message: "Konten berhasil disubmit untuk direview",
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const editMyContent = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;
    const contentData = req?.body;

    // Use service to edit user content
    const updatedContent = await editUserContent(id, contentData, customId);

    res.json({
      success: true,
      message: "Konten berhasil diupdate",
      data: updatedContent,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteMyContent = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    // Use service to delete user content
    await deleteUserContent(id, customId);

    res.json({
      success: true,
      message: "Konten berhasil dihapus",
    });
  } catch (error) {
    handleError(res, error);
  }
};
