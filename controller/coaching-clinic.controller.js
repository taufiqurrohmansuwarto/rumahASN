const User = require("@/models/users.model");
const CCMeetings = require("@/models/cc_meetings.model");
const CCMeetingsParticipants = require("@/models/cc_meetings_participants.model");
const jsonwebtoken = require("jsonwebtoken");

const appId = process.env.APP_ID;
const appSecret = process.env.APP_SECRET;

console.log({ appId, appSecret });

const createJWT = (user, id) => {
  const jwt = jsonwebtoken.sign(
    {
      context: {
        user: {
          avatar: user?.image,
          name: user?.name,
          email: user?.email,
        },
      },
      moderator: true,
      aud: "jitsi",
      iss: appId,
      sub: "coaching-online.site",
      room: id,
      exp: 1753498815,
    },
    appSecret
  );

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
    const limit = req?.query?.limit || 10;
    const { customId } = req?.user;

    const result = await CCMeetings.query()
      .where({ user_id: customId })
      .page(parseInt(page) - 1, parseInt(limit));

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
    const body = req?.body;
    await CCMeetings.query().insert({
      ...body,
      status: "upcoming",
      user_id: customId,
    });

    res.status(201).json({ message: "Success" });
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
const addMeetingParticipant = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const removeMeetingParticipant = async (req, res) => {
  try {
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
  addMeetingParticipant,
  removeMeetingParticipant,
  startMeetingParticipant,
};
