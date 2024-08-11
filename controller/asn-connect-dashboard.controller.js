const Discussions = require("@/models/discussions.model");
const CCMeetings = require("@/models/cc_meetings.model");
const Events = require("@/models/events.model");
const WebinarSeries = require("@/models/webinar-series.model");

const serialize = (data) => {
  return {
    id: data.id,
    title: data.title,
    date: data.created_at,
    upvotes: data.upvotes,
    downvotes: data.downvotes,
    comments: data.comments,
    author: data.user.username,
    avatar: data.user.image,
  };
};

const serializeCoachingClinic = (data) => {
  return {
    id: data?.id,
    title: data?.title,
    type: "coaching-clinic",
    date: data?.start_date,
    creator: data?.coach?.username,
    avatar: data?.coach?.image,
  };
};

const serializeWebinarSeries = (data) => {
  return {
    id: data?.id,
    title: data?.title,
    type: "webinar",
    date: data?.start_date,
    creator: data?.organizer,
    avatar: data?.author?.image,
  };
};

const serializeEevents = (data) => {
  return {};
};

const getEvents = async () => {
  const coachingClinic = await CCMeetings.query()
    .where("status", "upcoming")
    .andWhere("start_date", ">=", new Date())
    .andWhere("is_private", false)
    .withGraphFetched("[coach(simpleSelect)]");

  const webinarSeries = await WebinarSeries.query()
    .andWhere("start_date", ">=", new Date())
    .andWhere("status", "published")
    .withGraphFetched("[author(simpleSelect)]");

  const events = await Events.query()
    .where("start_datetime", ">=", new Date())
    .andWhere("is_publish", true);

  return [
    ...coachingClinic?.map(serializeCoachingClinic),
    ...webinarSeries?.map(serializeWebinarSeries),
    ...events?.map(serializeEevents),
  ];
};

const asnConnectDashboard = async (req, res) => {
  try {
    // get hot discussions
    const result = await Discussions.query()
      .select(
        "id",
        "title",
        "created_at as date",
        "upvote_count as upvotes",
        "downvote_count as downvotes",
        "total_comment as comments",
        "created_by"
      )
      .orderBy("total_comment", "asc")
      .where("is_active", true)
      .andWhere("type", "discussion")
      .withGraphFetched("[user]")
      .limit(3);

    const events = await getEvents();

    const data = {
      discussions: result?.length ? result?.map(serialize) : [],
      kegiatan: events,
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  asnConnectDashboard,
};
