const User = require("@/models/users.model");

// coaching clinic
const CCMeetings = require("@/models/cc_meetings.model");
const CCMeetingsParticipants = require("@/models/cc_meetings_participants.model");
const CCRatings = require("@/models/cc_ratings.model");

const jsonwebtoken = require("jsonwebtoken");
const moment = require("moment");
const { isArray } = require("lodash");

const appId = process.env.APP_ID;
const appSecret = process.env.APP_SECRET;

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
  const payload = {
    context: {
      user: {
        avatar: user?.image,
        name: `${user?.name} | Coach`,
        email: user?.email,
        id: user?.customId,
      },
    },
    moderator: true,
    aud: appId,
    iss: appId,
    sub: "coaching-online.site",
    room: id,
    exp: 1753498815,
  };

  const jwt = jsonwebtoken.sign(payload, appSecret);
  return jwt;
};

const createJwtParticipant = (user, id) => {
  const payload = {
    context: {
      user: {
        avatar: user?.image,
        name: `${user?.name}|Peserta`,
        email: user?.email,
        id: user?.customId,
      },
    },
    moderator: false,
    aud: appId,
    iss: appId,
    sub: "coaching-online.site",
    room: id,
    exp: 1753498815,
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
    const { customId } = req?.user;
    const result = await User.query().findById(customId);

    if (!result || !result?.is_consultant) {
      res.json(null);
    } else {
      res.json(true);
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
    const { customId } = req?.user;

    const currentUser = await User.query().findById(customId);

    if (!currentUser?.is_consultant) {
      res.status(403).json({ message: "Kamu bukan konsultan" });
    } else {
      const body = req?.body;
      await CCMeetings.query().insert({
        ...body,
        status: "upcoming",
        user_id: customId,
      });

      res.status(201).json({ message: "Success" });
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

    const currentMeeting = await CCMeetings.query().findById(id);

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

      if (alreadyJoin) {
        res.status(403).json({
          message: "You already join this meeting",
        });
      } else if (
        currentMeetingParticipan?.length > currentMeeting?.max_participant
      ) {
        res.status(403).json({
          message: "The meeting is full",
        });
      } else if (currentMeeting?.status !== "upcoming") {
        res.status(403).json({
          message: "The meeting is already started or ended",
        });
      } else {
        const result = await CCMeetingsParticipants.query()
          .upsertGraph({
            meeting_id: id,
            user_id: customId,
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
    const month = req?.query?.month || moment().format("MM");
    const year = req?.query?.year || moment().format("YYYY");
    const day = req?.query?.day;

    const result = await CCMeetings.query()
      .select(
        "*",
        CCMeetings.relatedQuery("participants").count().as("participants_count")
      )
      .where((builder) => {
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
      .andWhere("is_private", false)
      .withGraphFetched("[coach(simpleSelect), participants.[participant]]")
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
  // participant
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
};
