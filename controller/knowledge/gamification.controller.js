import { handleError } from "@/utils/helper/controller-helper";
import { transaction } from "objection";

const Badges = require("@/models/knowledge/badges.model");
const UserPoints = require("@/models/knowledge/user-points.model");
const UserBadges = require("@/models/knowledge/user-badges.model");
const XpLog = require("@/models/knowledge/xp-log.model");
const Missions = require("@/models/knowledge/missions.model");
const UserMissionProgress = require("@/models/knowledge/user-mission-progress.model");
const KnowledgeAiMetadata = require("@/models/knowledge/knowledge-ai-metadata.model");

const calcLevel = (points) => {
  // 50 points = level 1
  return Math.floor(Math.sqrt(points / 50)) + 1;
};

export const awardXP = async ({ userId, action, refType, refId, xp }) => {
  return await transaction(UserPoints.knex(), async (trx) => {
    // Guard sederhana: kalau event unik, cek di XpLog
    const mustBeUnique = [
      "read_complete",
      "publish_content",
      "quest_complete",
    ].includes(action);
    if (mustBeUnique) {
      const exists = await XpLog.query(trx).findOne({
        user_id: userId,
        action,
        ref_type: refType,
        ref_id: refId,
      });
      if (exists) return { skipped: true };
    }

    // Tulis log XP (opsional: enforce daily cap di sini)
    await XpLog.query(trx).insert({
      user_id: userId,
      action,
      ref_type: refType,
      ref_id: refId,
      xp,
    });

    // Upsert user_points
    const current = await UserPoints.query(trx).findById(userId);
    let newPoints = xp,
      newLevel = 1;
    if (current) {
      newPoints = current.points + xp;
      newLevel = calcLevel(newPoints);
      await UserPoints.query(trx).patchAndFetchById(userId, {
        points: newPoints,
        level: newLevel,
        last_updated: new Date(),
      });
    } else {
      newLevel = calcLevel(newPoints);
      await UserPoints.query(trx).insert({
        user_id: userId,
        points: newPoints,
        level: newLevel,
        last_updated: new Date(),
      });
    }

    // Auto-award badges by points threshold
    const eligible = await Badges.query(trx).where(
      "points_required",
      "<=",
      newPoints
    );
    if (eligible.length) {
      const owned = await UserBadges.query(trx).where("user_id", userId);
      const ownedSet = new Set(owned.map((b) => b.badge_id));
      const toGive = eligible.filter((b) => !ownedSet.has(b.id));
      if (toGive.length) {
        await UserBadges.query(trx).insert(
          toGive.map((b) => ({
            user_id: userId,
            badge_id: b.id,
            awarded_at: new Date(),
          }))
        );
      }
    }

    return { points: newPoints, level: newLevel, skipped: false };
  });
};

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

// user
export const getPoints = async (req, res) => {
  try {
    const user = req?.user;
    const points = await UserPoints.query().where("user_id", user?.id).first();
    const response = {
      data: points ?? { points: 0, level: 1 },
    };
    res.json(response);
  } catch (error) {
    handleError(res, error);
  }
};

export const userBadges = async (req, res) => {
  try {
    const { customId } = req?.user;
    const badges = await UserBadges.query()
      .where("user_id", customId)
      .withGraphFetched("badge");
    res.json({ data: badges });
  } catch (error) {
    handleError(res, error);
  }
};

export const leaderboard = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req?.query;
    const response = await UserPoints.query()
      .orderBy("points", "desc")
      .page(page - 1, limit);

    res.json({
      data: response?.results,
      meta: {
        limit: parseInt(limit),
        page: parseInt(page),
        total: response?.total,
        totalPages: response?.totalPages,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const userMissions = async (req, res) => {
  try {
    const { customId } = req?.user;
    const missions = await Missions.query().where("is_active", true);
    const prog = await UserMissionProgress.query().where("user_id", customId);
    const map = new Map(prog?.map((item) => [item?.mission_id, item]));
    const response = {
      data: missions?.map((item) => ({
        ...item,
        status: map.get(item?.id)?.status ?? "in_progress",
        completed_at: map.get(item?.id)?.completed_at ?? null,
      })),
    };
    res.json(response);
  } catch (error) {
    handleError(res, error);
  }
};

export const userMissionComplete = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { missionId } = req?.query;
    const mission = await Missions.query().findById(missionId);
    if (!mission || !mission?.is_active) {
      return res.status(404).json({ message: "Mission not found" });
    }

    const result = await transaction(
      UserMissionProgress.knex(),
      async (trx) => {
        const current = await UserMissionProgress.query(trx).findOne({
          user_id: customId,
          mission_id: missionId,
        });
        if (current?.status === "completed") return { already: true };

        // tandai completed
        if (current) {
          await UserMissionProgress.query(trx).patchAndFetchById(current.id, {
            status: "completed",
            completed_at: new Date(),
          });
        } else {
          await UserMissionProgress.query(trx).insert({
            user_id: customId,
            mission_id: missionId,
            status: "completed",
            completed_at: new Date(),
          });
        }

        // award XP
        const award = await awardXP({
          userId: customId,
          action: "quest_complete",
          refType: "mission",
          refId: missionId,
          xp: mission.points_reward,
        });

        return { award };
      }
    );
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const awardUserXP = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { action, refType, refId, xp } = req?.body;
    
    if (!action || !refType || !refId || !xp) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const result = await awardXP({
      userId: customId,
      action,
      refType,
      refId,
      xp,
    });

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const getUserGamificationSummary = async (req, res) => {
  try {
    const { customId } = req?.user;
    
    const [points, badges, missions] = await Promise.all([
      UserPoints.query().where("user_id", customId).first(),
      UserBadges.query()
        .where("user_id", customId)
        .withGraphFetched("badge"),
      Missions.query().where("is_active", true)
        .then(async (activeMissions) => {
          const progress = await UserMissionProgress.query()
            .where("user_id", customId);
          const progressMap = new Map(
            progress.map((item) => [item.mission_id, item])
          );
          return activeMissions.map((mission) => ({
            ...mission,
            status: progressMap.get(mission.id)?.status ?? "in_progress",
            completed_at: progressMap.get(mission.id)?.completed_at ?? null,
          }));
        }),
    ]);

    res.json({
      data: {
        points: points ?? { points: 0, level: 1 },
        badges: badges || [],
        missions: missions || [],
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};
