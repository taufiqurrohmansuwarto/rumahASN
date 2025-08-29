import { handleError } from "@/utils/helper/controller-helper";
import { transaction } from "objection";

const Badges = require("@/models/knowledge/badges.model");
const UserPoints = require("@/models/knowledge/user-points.model");
const UserBadges = require("@/models/knowledge/user-badges.model");
const XpLog = require("@/models/knowledge/xp-log.model");
const Missions = require("@/models/knowledge/missions.model");
const UserMissionProgress = require("@/models/knowledge/user-mission-progress.model");
// const KnowledgeAiMetadata = require("@/models/knowledge/knowledge-ai-metadata.model"); // not used

const calcLevel = (points) => {
  // Level formula: grows with sqrt of XP (e.g., ~50 XP -> Lv2)
  return Math.floor(Math.sqrt(points / 50)) + 1;
};

// Daily XP caps to prevent farming
const DAILY_XP_CAPS = {
  read_complete: 100,     // Max 100 XP dari reading per hari
  like_content: 50,       // Max 50 XP dari likes per hari  
  content_liked: 25,      // Max 25 XP dari being liked per hari
  comment_content: 75,    // Max 75 XP dari comments per hari
  bookmark_content: 30,   // Max 30 XP dari bookmarks per hari
  publish_content: 200,   // Max 200 XP dari publishing per hari
  quest_complete: 500,    // Max 500 XP dari missions per hari
};

// Action cooldowns (milliseconds)
const ACTION_COOLDOWNS = {
  like_content: 2000,      // 2 detik between likes
  comment_content: 10000,  // 10 detik between comments  
  read_complete: 5000,     // 5 detik between reads
  bookmark_content: 3000,  // 3 detik between bookmarks
  publish_content: 60000,  // 1 menit between publishes
};

// Helper function to award eligible badges
const awardEligibleBadges = async (
  trx,
  userId,
  totalXP,
  currentAction,
  refType,
  refId
) => {
  // Get all badges
  const allBadges = await Badges.query(trx);
  const ownedBadges = await UserBadges.query(trx).where("user_id", userId);
  const ownedBadgeIds = new Set(ownedBadges.map((b) => b.badge_id));


  // Check level badges (XP-based)
  const levelBadges = allBadges.filter((b) => {
    const hasValidPoints =
      typeof b.points_required === "number" && !isNaN(b.points_required);
    return (
      b.badge_type === "level" &&
      hasValidPoints &&
      b.points_required <= totalXP &&
      !ownedBadgeIds.has(b.id)
    );
  });

  if (levelBadges.length > 0) {
    await UserBadges.query(trx).insert(
      levelBadges.map((b) => ({
        user_id: userId,
        badge_id: b.id,
        awarded_at: new Date(),
      }))
    );
  }

  // Check achievement badges (action-based)
  const achievementBadges = allBadges.filter(
    (b) =>
      b.badge_type === "achievement" &&
      b.achievement_data &&
      !ownedBadgeIds.has(b.id)
  );

  for (const badge of achievementBadges) {
    try {
      const achievementData =
        typeof badge.achievement_data === "string"
          ? JSON.parse(badge.achievement_data)
          : badge.achievement_data;

      if (achievementData.type === "action_count") {
        // Count user's actions from xp_log
        const actionCount = await XpLog.query(trx)
          .where("user_id", userId)
          .where("action", achievementData.action)
          .count();

        const totalCount = parseInt(actionCount[0].count);

        if (totalCount >= achievementData.count) {
          await UserBadges.query(trx).insert({
            user_id: userId,
            badge_id: badge.id,
            awarded_at: new Date(),
          });
        }
      }
    } catch (parseError) {
      // Silently skip invalid badge configurations
    }
  }
};

export const awardXP = async ({
  userId,
  action,
  refType,
  refId,
  xp,
  isSelfAction = false,
}) => {
  return await transaction(UserPoints.knex(), async (trx) => {
    // Check cooldown first
    const cooldown = ACTION_COOLDOWNS[action];
    if (cooldown) {
      const lastAction = await XpLog.query(trx)
        .where('user_id', userId)
        .where('action', action)
        .orderBy('created_at', 'desc')
        .first();
        
      if (lastAction) {
        const timeSince = Date.now() - new Date(lastAction.created_at).getTime();
        if (timeSince < cooldown) {
          return { 
            skipped: true, 
            reason: 'cooldown_active',
            remainingTime: Math.ceil((cooldown - timeSince) / 1000)
          };
        }
      }
    }

    // Guard sederhana: kalau event unik, cek di XpLog
    const mustBeUnique = [
      "read_complete",
      "publish_content",
      "quest_complete",
      "like_content", // Prevent like farming
      "content_liked", // Prevent author-like farming (unique by composite ref)
      "comment_content", // Prevent comment farming
      "bookmark_content", // Prevent bookmark farming
    ].includes(action);
    if (mustBeUnique) {
      const exists = await XpLog.query(trx).findOne({
        user_id: userId,
        action,
        ref_type: refType,
        ref_id: refId,
      });
      if (exists) return { skipped: true, reason: 'already_awarded' };
    }

    // Reduce XP untuk self-action (action di konten sendiri)
    let finalXP = isSelfAction ? Math.floor(xp * 0.5) : xp; // 50% XP untuk self-action

    // Check daily XP cap
    const dailyCap = DAILY_XP_CAPS[action];
    if (dailyCap) {
      const today = new Date().toISOString().slice(0, 10);
      const todayXPResult = await XpLog.query(trx)
        .where('user_id', userId)
        .where('action', action)
        .where('created_at', '>=', `${today}T00:00:00.000Z`)
        .where('created_at', '<', `${today}T23:59:59.999Z`)
        .sum('xp as total');
        
      const todayXP = parseInt(todayXPResult[0]?.total || 0);
      
      if (todayXP >= dailyCap) {
        return { 
          skipped: true, 
          reason: 'daily_cap_exceeded',
          dailyCap,
          currentXP: todayXP 
        };
      }
      
      // Clamp XP to not exceed daily cap
      if (todayXP + finalXP > dailyCap) {
        finalXP = dailyCap - todayXP;
        if (finalXP <= 0) {
          return { 
            skipped: true, 
            reason: 'daily_cap_exceeded',
            dailyCap,
            currentXP: todayXP 
          };
        }
      }
    }

    // Tulis log XP
    await XpLog.query(trx).insert({
      user_id: userId,
      action,
      ref_type: refType,
      ref_id: refId,
      xp: finalXP,
    });

    // Upsert user_points - cari by user_id bukan by primary key
    const current = await UserPoints.query(trx).findOne({ user_id: userId });
    let newPoints = finalXP,
      newLevel = 1;
    if (current) {
      // UPDATE existing record - increment points
      newPoints = current.points + finalXP;
      newLevel = calcLevel(newPoints);
      await UserPoints.query(trx).patchAndFetchById(current.id, {
        points: newPoints,
        levels: newLevel,
        last_updated_at: new Date(),
      });
    } else {
      // INSERT new record untuk user baru
      newLevel = calcLevel(newPoints);
      await UserPoints.query(trx).insert({
        user_id: userId,
        points: newPoints,
        levels: newLevel,
        last_updated_at: new Date(),
      });
    }

    // Auto-award badges (both level and achievement types)
    try {
      await awardEligibleBadges(trx, userId, newPoints, action, refType, refId);
    } catch (badgeError) {
      // Don't throw - let XP award continue even if badge fails
    }

    return { points: newPoints, levels: newLevel, skipped: false };
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
    const badge = await Badges.query().patchAndFetchById(id, payload);
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
    const mission = await Missions.query().patchAndFetchById(id, payload);
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
    const { customId } = req?.user;
    const points = await UserPoints.query().where("user_id", customId).first();
    const response = {
      data: points ?? { points: 0, levels: 1 },
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
    const qp = req?.query || {};
    const limit = Math.max(1, parseInt(qp.limit ?? 10, 10));
    const page = Math.max(1, parseInt(qp.page ?? 1, 10));
    const response = await UserPoints.query()
      .orderBy("points", "desc")
      .page(page - 1, limit);

    const total = response?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    res.json({
      data: response?.results,
      meta: {
        limit,
        page,
        total,
        totalPages,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const userMissions = async (req, res) => {
  try {
    const { customId } = req?.user;
    const allMissions = await Missions.query().where("is_active", true);
    
    // Filter missions by date range
    const now = new Date();
    const missions = allMissions.filter(mission => {
      // Check start_date
      if (mission.start_date && new Date(mission.start_date) > now) {
        return false; // Mission belum dimulai
      }
      // Check end_date  
      if (mission.end_date && new Date(mission.end_date) < now) {
        return false; // Mission sudah berakhir
      }
      return true;
    });

    // Helper: compute current period range and key with timezone support
    const getPeriodRangeAndKey = (frequency, timezone) => {
      const now = new Date();
      
      // Handle timezone - default to UTC if not provided
      let localNow;
      if (timezone && timezone !== 'UTC') {
        try {
          // Create date in specified timezone
          localNow = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
        } catch (err) {
          // Invalid timezone, fallback to UTC
          localNow = now;
        }
      } else {
        localNow = now;
      }
      
      const base = new Date(
        Date.UTC(localNow.getUTCFullYear(), localNow.getUTCMonth(), localNow.getUTCDate())
      );
      let start = new Date(base);
      let end;
      let key;
      switch (frequency) {
        case "weekly": {
          const day = start.getUTCDay();
          const diff = (day + 6) % 7; // Monday=0
          start.setUTCDate(start.getUTCDate() - diff);
          end = new Date(start);
          end.setUTCDate(start.getUTCDate() + 7);
          key = `${start.getUTCFullYear()}-W${Math.ceil(
            ((start - new Date(Date.UTC(start.getUTCFullYear(), 0, 1))) /
              86400000 +
              1) /
              7
          )}`;
          break;
        }
        case "monthly": {
          start = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
          );
          end = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
          );
          key = `${start.getUTCFullYear()}-${String(
            start.getUTCMonth() + 1
          ).padStart(2, "0")}`;
          break;
        }
        case "daily":
        default: {
          end = new Date(start);
          end.setUTCDate(start.getUTCDate() + 1);
          key = start.toISOString().slice(0, 10);
        }
      }
      return { start, end, key };
    };

    const prog = await UserMissionProgress.query()
      .where("user_id", customId)
      .orderBy("updated_at", "asc");
    const progMap = new Map(prog?.map((item) => [item?.mission_id, item]));

    const data = [];
    for (const m of missions) {
      const period = getPeriodRangeAndKey(m.frequency, m.period_timezone);
      const p = progMap.get(m.id);
      const claimsThisPeriod =
        p?.period_key === period.key ? p?.claims_this_period || 0 : 0;
      const maxClaims = m?.max_claims_per_period ?? 1;

      // Parse rule or fallback to read_complete
      let rule = m?.rule;
      if (typeof rule === "string") {
        try {
          rule = JSON.parse(rule);
        } catch (_) {
          rule = null;
        }
      }
      const defaultTarget = m?.target_count ?? 1;
      if (!rule) {
        rule = {
          type: "action_count",
          action: "read_complete",
          ref_type: "content",
          target_count: defaultTarget,
          distinct_by: "ref_id",
        };
      }
      const targetCount = rule?.target_count ?? defaultTarget ?? 1;

      // Count progress from xp_log with enhanced security
      let progressCount = 0;
      try {
        const q = XpLog.query()
          .where("user_id", customId)
          .andWhere("action", rule.action)
          .modify((builder) => {
            if (rule.ref_type) builder.andWhere("ref_type", rule.ref_type);
            builder.whereBetween("created_at", [period.start, period.end]);
          });
          
        if (rule.distinct_by === "ref_id") {
          // Always use distinct for better security - prevents spam actions on same content
          const rs = await q.countDistinct("ref_id as count");
          progressCount = parseInt(rs?.[0]?.count ?? 0, 10) || 0;
        } else {
          // For non-distinct actions, add rate limiting by checking time gaps
          const allActions = await q.orderBy("created_at", "asc");
          let validActionCount = 0;
          let lastActionTime = null;
          
          const MIN_ACTION_GAP = ACTION_COOLDOWNS[rule.action] || 1000; // Default 1 second gap
          
          for (const actionLog of allActions) {
            const actionTime = new Date(actionLog.created_at).getTime();
            if (!lastActionTime || (actionTime - lastActionTime) >= MIN_ACTION_GAP) {
              validActionCount++;
              lastActionTime = actionTime;
            }
            // Skip actions that are too close together (likely spam)
          }
          
          progressCount = validActionCount;
        }
      } catch (_) {
        progressCount = 0;
      }

      let status = "in_progress";
      if (claimsThisPeriod >= maxClaims) status = "completed";
      else if (progressCount >= targetCount) status = "ready_to_claim";

      data.push({
        ...m,
        status,
        progress_count: progressCount,
        target_count: targetCount,
        period_key: period.key,
        claims_this_period: claimsThisPeriod,
        completed_at: p?.completed_at ?? null,
      });
    }

    res.json({ data });
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
    
    // Check mission date range
    const now = new Date();
    if (mission.start_date && new Date(mission.start_date) > now) {
      return res.status(400).json({ 
        message: "Mission belum dimulai",
        start_date: mission.start_date 
      });
    }
    if (mission.end_date && new Date(mission.end_date) < now) {
      return res.status(400).json({ 
        message: "Mission sudah berakhir",
        end_date: mission.end_date 
      });
    }

    const getPeriodRangeAndKey = (frequency, timezone) => {
      const now = new Date();
      
      // Handle timezone - default to UTC if not provided
      let localNow;
      if (timezone && timezone !== 'UTC') {
        try {
          // Create date in specified timezone
          localNow = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
        } catch (err) {
          // Invalid timezone, fallback to UTC
          localNow = now;
        }
      } else {
        localNow = now;
      }
      
      const base = new Date(
        Date.UTC(localNow.getUTCFullYear(), localNow.getUTCMonth(), localNow.getUTCDate())
      );
      let start = new Date(base);
      let end;
      let key;
      switch (frequency) {
        case "weekly": {
          const day = start.getUTCDay();
          const diff = (day + 6) % 7;
          start.setUTCDate(start.getUTCDate() - diff);
          end = new Date(start);
          end.setUTCDate(start.getUTCDate() + 7);
          key = `${start.getUTCFullYear()}-W${Math.ceil(
            ((start - new Date(Date.UTC(start.getUTCFullYear(), 0, 1))) /
              86400000 +
              1) /
              7
          )}`;
          break;
        }
        case "monthly": {
          start = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
          );
          end = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
          );
          key = `${start.getUTCFullYear()}-${String(
            start.getUTCMonth() + 1
          ).padStart(2, "0")}`;
          break;
        }
        case "daily":
        default: {
          end = new Date(start);
          end.setUTCDate(start.getUTCDate() + 1);
          key = start.toISOString().slice(0, 10);
        }
      }
      return { start, end, key };
    };

    const period = getPeriodRangeAndKey(
      mission.frequency,
      mission.period_timezone
    );

    // Parse mission rule or fallback
    let rule = mission?.rule;
    if (typeof rule === "string") {
      try {
        rule = JSON.parse(rule);
      } catch (_) {
        rule = null;
      }
    }
    const defaultTarget = mission?.target_count ?? 1;
    if (!rule) {
      rule = {
        type: "action_count",
        action: "read_complete",
        ref_type: "content",
        target_count: defaultTarget,
        distinct_by: "ref_id",
      };
    }
    const targetCount = rule?.target_count ?? defaultTarget ?? 1;

    // Count progress in current period with enhanced security
    let progressCount = 0;
    try {
      const q = XpLog.query()
        .where("user_id", customId)
        .andWhere("action", rule.action)
        .modify((builder) => {
          if (rule.ref_type) builder.andWhere("ref_type", rule.ref_type);
          builder.whereBetween("created_at", [period.start, period.end]);
        });
        
      if (rule.distinct_by === "ref_id") {
        // Always use distinct for better security - prevents spam actions on same content
        const rs = await q.countDistinct("ref_id as count");
        progressCount = parseInt(rs?.[0]?.count ?? 0, 10) || 0;
      } else {
        // For non-distinct actions, add rate limiting by checking time gaps
        const allActions = await q.orderBy("created_at", "asc");
        let validActionCount = 0;
        let lastActionTime = null;
        
        const MIN_ACTION_GAP = ACTION_COOLDOWNS[rule.action] || 1000; // Default 1 second gap
        
        for (const actionLog of allActions) {
          const actionTime = new Date(actionLog.created_at).getTime();
          if (!lastActionTime || (actionTime - lastActionTime) >= MIN_ACTION_GAP) {
            validActionCount++;
            lastActionTime = actionTime;
          }
          // Skip actions that are too close together (likely spam)
        }
        
        progressCount = validActionCount;
      }
    } catch (_) {
      progressCount = 0;
    }

    if (progressCount < targetCount) {
      return res
        .status(400)
        .json({
          message: "Target mission belum terpenuhi",
          progressCount,
          targetCount,
        });
    }

    const maxClaims = mission?.max_claims_per_period ?? 1;

    const result = await transaction(
      UserMissionProgress.knex(),
      async (trx) => {
        const current = await UserMissionProgress.query(trx)
          .where({ user_id: customId, mission_id: missionId })
          .orderBy("updated_at", "desc")
          .first();
        const claimsThisPeriod =
          current?.period_key === period.key
            ? current?.claims_this_period || 0
            : 0;
        if (claimsThisPeriod >= maxClaims) {
          return { already: true, periodKey: period.key };
        }

        const now = new Date();
        if (current) {
          await UserMissionProgress.query(trx).patchAndFetchById(current.id, {
            status: "completed",
            completed_at: now,
            period_key: period.key,
            progress_count: progressCount,
            last_progress_at: now,
            last_claimed_at: now,
            claims_this_period: claimsThisPeriod + 1,
          });
        } else {
          await UserMissionProgress.query(trx).insert({
            user_id: customId,
            mission_id: missionId,
            status: "completed",
            completed_at: now,
            period_key: period.key,
            progress_count: progressCount,
            last_progress_at: now,
            last_claimed_at: now,
            claims_this_period: 1,
          });
        }

        const award = await awardXP({
          userId: customId,
          action: "quest_complete",
          refType: "mission",
          refId: `${missionId}:${period.key}`,
          xp: mission.points_reward,
        });

        return { award, periodKey: period.key, progressCount };
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
    const { action, refType, refId } = req?.body || {};

    // Restrict manual XP award to a safe whitelist with server-defined XP
    const ALLOWED_ACTIONS = {
      // Example: completing a read action on a content
      read_complete: { xp: 2, allowSelf: true },
    };

    if (!action || !refType || !refId) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const def = ALLOWED_ACTIONS[action];
    if (!def) {
      return res
        .status(403)
        .json({ message: "Action not allowed from client" });
    }

    // Optionally determine self-action (reduce XP) for content-based actions
    let isSelfAction = false;
    if (refType === "content") {
      try {
        const KnowledgeContent = require("@/models/knowledge/contents.model");
        const content = await KnowledgeContent.query().findById(refId);
        isSelfAction = content?.author_id === customId;
      } catch (e) {
        // ignore detection errors; default false
      }
    }

    const result = await awardXP({
      userId: customId,
      action,
      refType,
      refId,
      xp: def.xp,
      isSelfAction: isSelfAction && def.allowSelf,
    });

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const getUserGamificationSummary = async (req, res) => {
  try {
    const { customId } = req?.user;

    // Cek dan award badge yang eligible dulu sebelum fetch data
    const currentPoints = await UserPoints.query()
      .where("user_id", customId)
      .first();

    if (currentPoints) {
      try {
        await transaction(UserPoints.knex(), async (trx) => {
          await awardEligibleBadges(
            trx,
            customId,
            currentPoints.points,
            "summary_check",
            "user",
            customId
          );
        });
      } catch (badgeError) {
        // Don't throw - let summary continue even if badge check fails
      }
    } else {
      // Jika belum ada points, buat entry default dengan 0 XP
      try {
        await transaction(UserPoints.knex(), async (trx) => {
          await UserPoints.query(trx).insert({
            user_id: customId,
            points: 0,
            levels: 1,
            last_updated_at: new Date(),
          });

          await awardEligibleBadges(
            trx,
            customId,
            0,
            "summary_check",
            "user",
            customId
          );
        });
      } catch (createError) {
        // Silently handle error
      }
    }

    const [points, badges, missions] = await Promise.all([
      UserPoints.query().where("user_id", customId).first(),
      UserBadges.query().where("user_id", customId).withGraphFetched("badge"),
      Missions.query()
        .where("is_active", true)
        .then(async (activeMissions) => {
          const progress = await UserMissionProgress.query().where(
            "user_id",
            customId
          );
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
        points: points ?? { points: 0, levels: 1 },
        badges: badges || [],
        missions: missions || [],
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};
