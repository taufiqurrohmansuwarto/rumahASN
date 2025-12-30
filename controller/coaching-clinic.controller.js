const User = require("@/models/users.model");

// coaching clinic
const CCMeetings = require("@/models/cc_meetings.model");
const CCMeetingsParticipants = require("@/models/cc_meetings_participants.model");
const CCRatings = require("@/models/cc_ratings.model");
const CCVideoSessions = require("@/models/cc_video_sessions.model");

const jsonwebtoken = require("jsonwebtoken");

// Constants
const HEARTBEAT_TIMEOUT_MS = 2 * 60 * 1000; // 2 menit
const { isArray, toNumber, round, trim } = require("lodash");

const appId = process.env.APP_ID;
const appSecret = process.env.APP_SECRET;

const dayjs = require("dayjs");
require("dayjs/locale/id");
dayjs.locale("id");

const ratingMeetingParticipant = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    const result = await CCRatings.query()
      .where({
        meeting_id: id,
        user_id: customId,
      })
      .first();

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const giveRatingMeeting = async (req, res) => {
  try {
    const { body } = req;
    const { customId } = req?.user;
    const { id } = req?.query;

    const result = await CCMeetingsParticipants.query()
      .where({
        id,
        user_id: customId,
      })
      .first();

    if (!result) {
      res.status(404).json({ message: "Not found" });
    } else {
      const meetingId = result?.meeting_id;

      await CCRatings.query()
        .insert({
          ...body,
          user_id: customId,
          meeting_id: meetingId,
        })
        .onConflict(["user_id", "meeting_id"])
        .merge();

      res.json({ message: "Success" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createJWT = (user, id) => {
  const now = Math.floor(Date.now() / 1000); // detik (UTC)
  const skew = 60; // toleransi 60 detik
  const ttl = 60 * 60;

  const payload = {
    context: {
      user: {
        avatar: user?.image,
        name: `${user?.name} | Coach`,
        email: user?.email,
        id: user?.customId,
      },
    },
    nbf: now - skew,
    exp: now + ttl,
    moderator: true,
    aud: appId,
    iss: appId,
    sub: "coaching-online.site",
    room: id,
  };

  const jwt = jsonwebtoken.sign(payload, appSecret);
  return jwt;
};

const createJwtParticipant = (user, id) => {
  const now = Math.floor(Date.now() / 1000); // detik (UTC)
  const skew = 60; // toleransi 60 detik
  const ttl = 60 * 60; // 1 jam

  const payload = {
    context: {
      user: {
        avatar: user?.image,
        name: `${user?.name} | Peserta`,
        email: user?.email,
        id: user?.customId,
      },
    },
    nbf: now - skew,
    exp: now + ttl,
    moderator: false,
    aud: appId,
    iss: appId,
    sub: "coaching-online.site",
    room: id,
  };

  const jwt = jsonwebtoken.sign(payload, appSecret);
  return jwt;
};

const alterUserCoach = async (req, res) => {
  try {
    const { id } = req?.query;

    //     check dulu apakah dia current_role sudah agent atau admin
    const currentUser = await User.query().findById(id);

    if (
      currentUser.current_role !== "agent" &&
      currentUser.current_role !== "admin"
    ) {
      res.status(403).json({ code: 403, message: "Forbidden" });
    } else {
      const user = await User.query()
        .patch({
          is_consultant: true,
          update_consultant_at: new Date(),
        })
        .where({ custom_id: id });
      console.log(user);
      res.json({ message: "Success" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const dropUserCoach = async (req, res) => {
  try {
    const { id } = req?.query;

    const currentUser = await User.query().findById(id);

    if (
      currentUser.current_role !== "agent" &&
      currentUser.current_role !== "admin"
    ) {
      res.status(403).json({ code: 403, message: "Forbidden" });
    } else {
      const user = await User.query()
        .patch({
          is_consultant: false,
          update_consultant_at: new Date(),
        })
        .where({ custom_id: id });
      console.log(user);
      res.json({ message: "Success" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const checkStatusCoaching = async (req, res) => {
  try {
    const { customId, group, role } = req?.user;
    const result = await User.query().findById(customId);
    const fasilitatorMaster = group === "MASTER" && role === "FASILITATOR";

    if (result?.is_consultant || fasilitatorMaster) {
      res.json(true);
    } else {
      res.json(null);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// CRUD meeting
const findMeeting = async (req, res) => {
  try {
    const page = req?.query?.page || 1;
    const limit = req?.query?.limit || 20;

    const status = req?.query?.status;
    const rangeDate = req?.query?.range_date;
    const title = req?.query?.title;

    const { customId } = req?.user;

    const result = await CCMeetings.query()
      .where({ user_id: customId })
      .andWhere((builder) => {
        if (status) {
          builder.where("status", status);
        }
        if (isArray(rangeDate)) {
          builder.whereBetween("start_date", rangeDate);
        }
        if (title) {
          builder.where("title", "ilike", `%${title}%`);
        }
      })
      .select(
        "*",
        CCMeetings.relatedQuery("participants").count().as("participants_count")
      )
      .withGraphFetched("[coach(simpleSelect)]")
      .page(parseInt(page) - 1, parseInt(limit))
      .orderBy("created_at", "desc");

    const data = {
      data: result.results,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createMeeting = async (req, res) => {
  try {
    const { customId, group, role } = req?.user;

    const currentUser = await User.query().findById(customId);
    const fasilitatorMaster = group === "MASTER" && role === "FASILITATOR";

    if (currentUser?.is_consultant || fasilitatorMaster) {
      const body = req?.body;
      await CCMeetings.query().insert({
        ...body,
        status: "upcoming",
        user_id: customId,
      });

      res.status(201).json({ message: "Success" });
    } else {
      res.status(403).json({ message: "Kamu bukan konsultan" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const removeMeeting = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    await CCMeetings.query().delete().where({
      id,
      user_id: customId,
    });
    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateMeeting = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;
    const body = req?.body;

    await CCMeetings.query().patch(body).where({
      id,
      user_id: customId,
    });

    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getMeeting = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    const result = await CCMeetings.query()
      .where({
        id,
        user_id: customId,
      })
      .withGraphFetched(
        "[participants(allSelect).[participant(simpleSelect)], coach(simpleSelect)]"
      )

      .first();

    if (result?.status === "live") {
      res.json({
        ...result,
        jwt: createJWT(req?.user, id),
      });
    } else {
      res.json(result);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const startMeeting = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    const result = await CCMeetings.query()
      .patch({
        status: "live",
      })
      .where({
        id,
        user_id: customId,
      });

    // todo send email to participant

    res.json({
      ...result,
      jwt: createJWT(req?.user, id),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const endMeeting = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    const result = await CCMeetings.query()
      .patch({
        status: "end",
      })
      .where({
        id,
        user_id: customId,
      });

    res.json({
      ...result,
      jwt: createJWT(req?.user, id),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// CRUD participant
const joinMeeting = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;
    const { reason } = req?.body;

    const currentMeeting = await CCMeetings.query()
      .findById(id)
      .withGraphFetched("[participants]");

    const maxParticipants = currentMeeting?.max_participants;
    const participantsCount = currentMeeting?.participants?.length;

    if (!currentMeeting) {
      res.status(404).json({ message: "Not found" });
    } else {
      const currentMeetingParticipan =
        await CCMeetingsParticipants.query().where({
          meeting_id: id,
        });

      const alreadyJoin = await CCMeetingsParticipants.query()
        .where({
          meeting_id: id,
          user_id: customId,
        })
        .first();

      if (maxParticipants === participantsCount) {
        res.status(403).json({
          message: "The meeting is full",
        });
      } else if (alreadyJoin) {
        res.status(403).json({
          message: "You already join this meeting",
        });
      } else if (
        currentMeetingParticipan?.length > currentMeeting?.max_participant
      ) {
        res.status(403).json({
          message: "The meeting is full",
        });
      } else if (currentMeeting?.status === "end") {
        res.status(403).json({
          message: "The meeting is ended",
        });
      } else {
        const result = await CCMeetingsParticipants.query()
          .upsertGraph({
            meeting_id: id,
            user_id: customId,
            reason,
          })
          .onConflict(["meeting_id", "user_id"])
          .merge()
          .returning("*");

        res.json(result);
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteMeeting = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    const result = await CCMeetingsParticipants.query().delete().where({
      meeting_id: id,
      user_id: customId,
    });

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const startMeetingParticipant = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const meetingsParticipants = async (req, res) => {
  try {
    const { customId } = req?.user;
    const page = req?.query?.page || 1;
    const limit = req?.query?.limit || 25;

    // status, judul, tanggal
    const status = req?.query?.status;
    const title = req?.query?.title;
    const rangeDate = req?.query?.range_date;

    let query = {};

    query = CCMeetingsParticipants.query()
      .where("cc_meetings_participants.user_id", customId)
      .withGraphFetched("[meeting.[coach(simpleSelect)]]");

    if (status) {
      query = query.joinRelated("meeting").where("meeting.status", status);
    }

    if (title) {
      query = query
        .joinRelated("meeting")
        .where("meeting.title", "ilike", `%${title}%`);
    }

    if (isArray(rangeDate)) {
      query = query
        .joinRelated("meeting")
        .whereBetween("meeting.start_date", rangeDate);
    }

    const result = await query
      .page(parseInt(page) - 1, parseInt(limit))
      .orderBy("created_at", "desc");

    const data = {
      data: result.results,
      total: result.total,
      page: parseInt(page),
      limit: parseInt(limit),
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const detailMeetingParticipant = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    const result = await CCMeetingsParticipants.query()
      .where({
        id,
        user_id: customId,
      })
      .first()
      .withGraphFetched("[meeting.[coach(simpleSelect)]]");

    const currentMeeting = await CCMeetings.query().findById(
      result?.meeting_id
    );

    const participants = await CCMeetingsParticipants.query()
      .where({
        meeting_id: result?.meeting_id,
      })
      .withGraphFetched("[participant(simpleSelect)]")
      .orderBy("created_at", "desc");

    if (currentMeeting?.status === "live") {
      const jwt = createJwtParticipant(req?.user, result?.meeting_id);
      res.json({
        ...result,
        jwt,
        participants,
      });
    } else {
      res.json({
        ...result,
        jwt: null,
        participants,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const upcomingMeetings = async (req, res) => {
  try {
    const month = req?.query?.month || dayjs().format("MM");
    const year = req?.query?.year || dayjs().format("YYYY");
    const day = req?.query?.day;
    const user = req?.user;

    const statusKepegawaian = user?.status_kepegawaian;

    const result = await CCMeetings.query()
      .select(
        "*",
        CCMeetings.relatedQuery("participants").count().as("participants_count")
      )
      .where((builder) => {
        builder
          .whereRaw("?? @> ?::text[]", [
            "participants_type",
            [statusKepegawaian],
          ])
          .orWhereNull("participants_type");

        if (day) {
          builder.whereRaw(
            `extract(year from start_date) = ${year} and extract(month from start_date) = ${month} and extract(day from start_date) = ${day}`
          );
        } else {
          builder.whereRaw(
            `extract(year from start_date) = ${year} and extract(month from start_date) = ${month}`
          );
        }
      })
      .andWhereRaw(
        `extract(year from start_date) = ${year} and extract(month from start_date) = ${month}`
      )
      .andWhere("is_private", false)
      .withGraphFetched("[coach(simpleWithImage), participants.[participant]]")
      .orderBy("created_at", "asc");

    const checkCurrent = await CCMeetingsParticipants.query().andWhere(
      "user_id",
      req?.user?.customId
    );

    const data = result.map((item) => {
      const isJoin = checkCurrent.find(
        (participant) => participant?.meeting_id === item?.id
      );

      return {
        ...item,
        is_join: !!isJoin,
        detail_id: isJoin?.id,
      };
    });

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const detailMeetingsParticipantsByDay = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// addRemove participant
const addParticipant = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;
    const body = req?.body;

    const currentMeeting = await CCMeetings.query()
      .where({ id, user_id: customId })
      .first();

    if (!currentMeeting) {
      res.status(404).json({ message: "Not found" });
    } else {
      await CCMeetingsParticipants.query()
        .insert({
          user_id: body?.user_id,
          meeting_id: id,
        })
        .onConflict(["meeting_id", "user_id"])
        .merge();
      res.json({ message: "Success" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const removeParticipant = async (req, res) => {
  try {
    const { id, participantId } = req?.query;
    const { customId } = req?.user;

    const currentMeeting = await CCMeetings.query()
      .where({ id, user_id: customId })
      .first();

    if (!currentMeeting) {
      res.status(404).json({ message: "Not found" });
    } else {
      await CCMeetingsParticipants.query()
        .delete()
        .where({ id: participantId });

      res.json({ message: "Success" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getRatingMeetingConsultant = async (req, res) => {
  try {
    const { id } = req?.query;
    const avgRating = await CCRatings.query()
      .where({ meeting_id: id })
      .avg("stars")
      .first();

    const countRating = await CCRatings.query()
      .where({ meeting_id: id })
      .count("stars")
      .first();

    const data = {
      avg: toNumber(round(avgRating?.avg, 2)) || 0,
      count: toNumber(countRating?.count) || 0,
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const searchByCode = async (req, res) => {
  try {
    const code = req?.query?.code;
    const currentUser = req?.user;
    const statusKepegawaian = currentUser?.status_kepegawaian;
    const result = await CCMeetings.query()
      .where("code", trim(code))
      .andWhere("is_private", true)
      .andWhere((builder) => {
        builder
          .whereRaw("?? @> ?::text[]", [
            "participants_type",
            [statusKepegawaian],
          ])
          .orWhereNull("participants_type");
      })
      .withGraphFetched("[coach(simpleSelect)]")
      .first();

    if (!result) {
      res.json(null);
    } else {
      const currentMeetingParticipants =
        await CCMeetingsParticipants.query().where({
          meeting_id: result?.id,
          user_id: currentUser?.customId,
        });

      const isJoin = currentMeetingParticipants?.filter((item) => {
        return (
          item?.meeting_id === result?.id &&
          item?.user_id === currentUser?.customId
        );
      });

      const data = {
        ...result,
        currentMeetingParticipants: currentMeetingParticipants?.length,
        is_join: isJoin?.length > 0,
        current_meeting_id: isJoin?.[0]?.id,
      };

      res.json(data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ==========================================
// VIDEO SESSION MANAGEMENT (Persistence)
// ==========================================

/**
 * Cek apakah user punya active video session
 * Digunakan saat login/refresh untuk auto-resume
 */
const getActiveVideoSession = async (req, res) => {
  try {
    const { customId } = req?.user;

    // Find active session for this user
    const session = await CCVideoSessions.query()
      .where({ user_id: customId, status: "active" })
      .withGraphFetched("[meeting.[coach(simpleSelect)]]")
      .first();

    // No active session
    if (!session) {
      return res.json({ hasActiveSession: false });
    }

    // Check heartbeat timeout - cleanup stale session
    const lastHeartbeat = new Date(session.last_heartbeat);
    const now = new Date();
    if (now - lastHeartbeat > HEARTBEAT_TIMEOUT_MS) {
      await CCVideoSessions.query()
        .patch({ status: "disconnected", ended_at: new Date() })
        .where({ id: session.id });
      return res.json({ hasActiveSession: false });
    }

    // Check if meeting is still live
    if (session.meeting?.status !== "live") {
      await CCVideoSessions.query()
        .patch({ status: "ended", ended_at: new Date() })
        .where({ id: session.id });
      return res.json({ hasActiveSession: false });
    }

    // Generate fresh JWT based on role
    const isConsultant = session.role === "consultant";
    const jwt = isConsultant
      ? createJWT(req.user, session.meeting_id)
      : createJwtParticipant(req.user, session.meeting_id);

    res.json({
      hasActiveSession: true,
      meetingData: {
        id: session.meeting_id,
        jwt,
        isParticipant: !isConsultant,
        title: session.meeting?.title,
        coach: session.meeting?.coach,
        participant: isConsultant ? null : { username: req.user.name },
        sessionId: session.id,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Buat video session saat join/start meeting
 * 1 user hanya boleh punya 1 active session (baik consultant maupun participant)
 */
const createVideoSession = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { meetingId, role } = req?.body;

    if (!meetingId || !role) {
      return res.status(400).json({ message: "meetingId and role are required" });
    }

    // Validate role
    if (!["consultant", "participant"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Check if meeting exists and is valid
    const meeting = await CCMeetings.query().findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Use transaction to prevent race condition
    const result = await CCVideoSessions.transaction(async (trx) => {
      // Check for existing active session (any role)
      const existingSession = await CCVideoSessions.query(trx)
        .where({ user_id: customId, status: "active" })
        .forUpdate()
        .first();

      if (existingSession) {
        // If same meeting, just return existing session
        if (existingSession.meeting_id === meetingId) {
          // Update heartbeat
          await CCVideoSessions.query(trx)
            .patch({ last_heartbeat: new Date() })
            .where({ id: existingSession.id });
          return { sessionId: existingSession.id, reused: true };
        }

        // Different meeting - end existing session first
        await CCVideoSessions.query(trx)
          .patch({ status: "ended", ended_at: new Date() })
          .where({ id: existingSession.id });
      }

      // Create new session
      const newSession = await CCVideoSessions.query(trx).insert({
        user_id: customId,
        meeting_id: meetingId,
        role,
        status: "active",
      });

      return { sessionId: newSession.id, reused: false };
    });

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * End video session saat leave/end meeting
 */
const endVideoSession = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { meetingId } = req?.body;

    if (!meetingId) {
      return res.status(400).json({ message: "meetingId is required" });
    }

    const updated = await CCVideoSessions.query()
      .patch({ status: "ended", ended_at: new Date() })
      .where({ user_id: customId, meeting_id: meetingId, status: "active" });

    res.json({ message: "Session ended", updated });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * End all participant sessions for a meeting (called when consultant ends meeting)
 */
const endAllMeetingVideoSessions = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { meetingId } = req?.body;

    if (!meetingId) {
      return res.status(400).json({ message: "meetingId is required" });
    }

    // Verify user is the consultant of this meeting
    const meeting = await CCMeetings.query()
      .where({ id: meetingId, user_id: customId })
      .first();

    if (!meeting) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // End all active sessions for this meeting
    const updated = await CCVideoSessions.query()
      .patch({ status: "ended", ended_at: new Date() })
      .where({ meeting_id: meetingId, status: "active" });

    res.json({ message: "All sessions ended", updated });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Update heartbeat untuk keep session alive
 */
const heartbeatVideoSession = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { meetingId } = req?.body;

    if (!meetingId) {
      return res.status(400).json({ message: "meetingId is required" });
    }

    const updated = await CCVideoSessions.query()
      .patch({ last_heartbeat: new Date() })
      .where({ user_id: customId, meeting_id: meetingId, status: "active" });

    if (updated === 0) {
      return res.status(404).json({ message: "No active session found" });
    }

    res.json({ message: "Heartbeat updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Cek apakah consultant sudah punya live meeting (prevent multiple)
 * User tidak boleh jadi consultant DAN participant secara bersamaan
 */
const checkUserHasActiveSession = async (req, res) => {
  try {
    const { customId } = req?.user;

    const activeSession = await CCVideoSessions.query()
      .where({ user_id: customId, status: "active" })
      .withGraphFetched("[meeting]")
      .first();

    if (!activeSession) {
      return res.json({ hasActiveSession: false });
    }

    // Check heartbeat timeout
    const lastHeartbeat = new Date(activeSession.last_heartbeat);
    const now = new Date();
    if (now - lastHeartbeat > HEARTBEAT_TIMEOUT_MS) {
      // Stale session - cleanup
      await CCVideoSessions.query()
        .patch({ status: "disconnected", ended_at: new Date() })
        .where({ id: activeSession.id });
      return res.json({ hasActiveSession: false });
    }

    // Check if meeting still live
    if (activeSession.meeting?.status !== "live") {
      await CCVideoSessions.query()
        .patch({ status: "ended", ended_at: new Date() })
        .where({ id: activeSession.id });
      return res.json({ hasActiveSession: false });
    }

    res.json({
      hasActiveSession: true,
      meetingId: activeSession.meeting_id,
      role: activeSession.role,
      meetingTitle: activeSession.meeting?.title,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ==========================================
// NOTULA / REKAP DISKUSI MANAGEMENT
// ==========================================

/**
 * Get notula for a meeting
 */
const getNotula = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    const meeting = await CCMeetings.query()
      .where({ id, user_id: customId })
      .select("id", "title", "notula", "notula_updated_at", "notula_sent", "notula_sent_at")
      .first();

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    res.json({
      meetingId: meeting.id,
      title: meeting.title,
      notula: meeting.notula || "",
      updatedAt: meeting.notula_updated_at,
      sent: meeting.notula_sent || false,
      sentAt: meeting.notula_sent_at,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Update/save notula for a meeting
 */
const updateNotula = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;
    const { notula } = req?.body;

    if (notula === undefined) {
      return res.status(400).json({ message: "notula content is required" });
    }

    // Verify ownership
    const meeting = await CCMeetings.query()
      .where({ id, user_id: customId })
      .first();

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Update notula
    await CCMeetings.query()
      .patch({
        notula,
        notula_updated_at: new Date(),
      })
      .where({ id });

    res.json({
      message: "Notula berhasil disimpan",
      updatedAt: new Date(),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Send notula to all participants via rasn_mail
 */
const sendNotulaToParticipants = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;
    const { subject: customSubject } = req?.body;

    // Get meeting with participants
    const meeting = await CCMeetings.query()
      .where({ id, user_id: customId })
      .withGraphFetched("[participants.[participant], coach(simpleSelect)]")
      .first();

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    if (!meeting.notula || meeting.notula.trim() === "") {
      return res.status(400).json({ message: "Notula belum diisi" });
    }

    // Get participant user IDs
    const participantIds = meeting.participants
      ?.map((p) => p?.participant?.custom_id)
      ?.filter(Boolean);

    if (!participantIds || participantIds.length === 0) {
      return res.status(400).json({ message: "Tidak ada peserta untuk dikirim" });
    }

    // Prepare email content
    const emailSubject = customSubject || `Notula: ${meeting.title}`;
    const emailContent = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0;">
    <h2 style="color: white; margin: 0;">📝 Notula Coaching Clinic</h2>
    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">${meeting.title}</p>
  </div>
  <div style="padding: 20px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="color: #6b7280; margin-bottom: 16px;">
      Berikut adalah rekap/notula dari sesi coaching clinic yang telah dilaksanakan:
    </p>
    <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
      ${meeting.notula}
    </div>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
      Dikirim oleh: ${meeting.coach?.username || "Coach"}<br>
      Tanggal: ${dayjs().format("DD MMMM YYYY HH:mm")}
    </p>
  </div>
</div>
    `.trim();

    // Send via EmailService
    const EmailService = require("@/utils/services/EmailServices");
    
    await EmailService.sendPersonalEmail({
      senderId: customId,
      subject: emailSubject,
      content: emailContent,
      recipients: {
        to: participantIds.map((userId) => ({ recipient_id: userId })),
        cc: [],
        bcc: [],
      },
      priority: "normal",
    });

    // Update meeting to mark notula as sent
    await CCMeetings.query()
      .patch({
        notula_sent: true,
        notula_sent_at: new Date(),
      })
      .where({ id });

    res.json({
      message: `Notula berhasil dikirim ke ${participantIds.length} peserta`,
      recipientCount: participantIds.length,
      sentAt: new Date(),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * AI Refine Notula - Merapikan teks notula dengan bahasa baku
 */
const refineNotula = async (req, res) => {
  try {
    const { text } = req?.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Teks tidak boleh kosong" });
    }

    if (text.length > 10000) {
      return res.status(400).json({ message: "Teks terlalu panjang (maksimal 10000 karakter)" });
    }

    const OpenAI = require("openai");
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `Kamu adalah asisten profesional untuk merapikan notula/rekap diskusi coaching clinic.

TUGAS: Rapikan dan perbaiki teks notula berikut menjadi format yang profesional dan rapi.

ATURAN PENTING:
1. Gunakan Bahasa Indonesia yang BAKU dan FORMAL
2. Perbaiki tata bahasa, ejaan, dan tanda baca yang salah
3. Susun dalam format yang rapi dan terstruktur:
   - Gunakan bullet points atau numbering jika perlu
   - Kelompokkan berdasarkan topik jika ada beberapa topik
4. Pertahankan semua informasi dan makna asli
5. Jangan tambahkan informasi baru yang tidak ada di teks asli
6. Jangan ubah nama, tanggal, angka, atau data spesifik
7. Tambahkan struktur jika perlu:
   - Topik Pembahasan
   - Poin-poin Penting
   - Kesimpulan & Tindak Lanjut (jika ada)
8. Hasil akhir harus profesional namun mudah dibaca

TEKS NOTULA ASLI:
${text}

Berikan HANYA teks hasil perbaikan tanpa penjelasan tambahan.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Kamu adalah asisten profesional yang merapikan notula rapat/diskusi. Berikan hanya hasil perbaikan tanpa penjelasan.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 3000,
    });

    const refinedText = completion.choices[0]?.message?.content?.trim() || "";

    if (!refinedText) {
      return res.status(500).json({ message: "Gagal memproses teks" });
    }

    res.json({
      original: text,
      refined: refinedText,
      tokensUsed: completion.usage?.total_tokens || 0,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  alterUserCoach,
  dropUserCoach,
  checkStatusCoaching,
  // instructur
  findMeeting,
  createMeeting,
  removeMeeting,
  updateMeeting,
  getMeeting,
  startMeeting,
  endMeeting,
  getRatingMeetingConsultant,
  // participant
  searchByCode,
  meetingsParticipants,
  detailMeetingParticipant,
  joinMeeting,
  deleteMeeting,
  startMeetingParticipant,
  upcomingMeetings,
  detailMeetingsParticipantsByDay,
  giveRatingMeeting,
  addParticipant,
  removeParticipant,
  ratingMeetingParticipant,
  // video session management
  getActiveVideoSession,
  createVideoSession,
  endVideoSession,
  endAllMeetingVideoSessions,
  heartbeatVideoSession,
  checkUserHasActiveSession,
  // notula management
  getNotula,
  updateNotula,
  sendNotulaToParticipants,
  refineNotula,
};
