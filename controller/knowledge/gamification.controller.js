const Badges = require("@/models/knowledge/badges.model");
const UserPoints = require("@/models/knowledge/user-points.model");
const UserMissionProgress = require("@/models/knowledge/user-mission-progress.model");
const Missions = require("@/models/knowledge/missions.model");
const KnowledgeAiMetadata = require("@/models/knowledge/knowledge-ai-metadata.model");
const { handleError } = require("@/utils/error");

// crud badges untuk admin
export const getBadges = async (req, res) => {
  try {
    const badges = await Badges.query();
    res.json(badges);
  } catch (error) {
    handleError(res, error);
  }
};

export const createBadges = async (req, res) => {
  try {
    const payload = req?.body;
    const badge = await Badges.query().insert(payload);
    res.json(badge);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateBadges = async (req, res) => {
  try {
    const { id } = req?.query;
    const payload = req?.body;
    const badge = await Badges.query().findById(id).patch(payload);
    res.json(badge);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteBadges = async (req, res) => {
  try {
    const { id } = req?.query;
    await Badges.query().findById(id).delete();
    res.json({ message: "Badge deleted successfully" });
  } catch (error) {
    handleError(res, error);
  }
};

// crud missions untuk admin
export const createMissions = async (req, res) => {
  try {
    const payload = req?.body;
    const mission = await Missions.query().insert(payload);
    res.json(mission);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateMissions = async (req, res) => {
  try {
    const { id } = req?.query;
    const payload = req?.body;
    const mission = await Missions.query().findById(id).patch(payload);
    res.json(mission);
  } catch (error) {
    handleError(res, error);
  }
};

export const getMissions = async (req, res) => {
  try {
    const missions = await Missions.query();
    res.json(missions);
  } catch (error) {
    handleError(res, error);
  }
};

export const getMissionById = async (req, res) => {
  try {
    const { id } = req?.query;
    const mission = await Missions.query().findById(id);
    res.json(mission);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteMission = async (req, res) => {
  try {
    const { id } = req?.query;
    await Missions.query().findById(id).delete();
    res.json({ message: "Mission deleted successfully" });
  } catch (error) {
    handleError(res, error);
  }
};
