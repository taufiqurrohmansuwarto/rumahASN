const KnowledgeUserInteraction = require("@/models/knowledge/user-interactions.model");
const KnowledgeContent = require("@/models/knowledge/contents.model");
import { handleError } from "@/utils/helper/controller-helper";

export const likes = async (req, res) => {
  try {
    const { id } = req?.query;
  } catch (error) {
    handleError(res, error);
  }
};

export const dislikes = async (req, res) => {
  try {
  } catch (error) {
    handleError(res, error);
  }
};

export const comment = async (req, res) => {
  try {
  } catch (error) {
    handleError(res, error);
  }
};

export const view = async (req, res) => {
  try {
  } catch (error) {
    handleError(res, error);
  }
};

export const bookmark = async (req, res) => {
  try {
  } catch (error) {
    handleError(res, error);
  }
};
