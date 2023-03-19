const Ticket = require("../models/tickets.model");
const TicketsSubscriptions = require("../models/tickets_subscriptions.model");
const TicketsReactions = require("../models/tickets_reactions.model");
const TicketHistories = require("../models/tickets_histories.model");
const Comments = require("../models/tickets_comments_customers.model");
const Subscriptions = require("../models/tickets_subscriptions.model");

const { insertTicketHistory } = require("@/utils/tickets-utilities");
const {
  serializeComments,
  serializeHistories,
  serializeData,
} = require("@/utils/parsing");
const { uniqBy } = require("lodash");

const publishedTickets = async (req, res) => {
  try {
    const page = req?.query?.page || 1;
    const limit = req?.query?.limit || 25;
    const search = req?.query?.search || "";

    const result = await Ticket.query()
      .where({ is_published: true })
      .withGraphFetched("[customer(simpleSelect)]")
      .andWhere((builder) => {
        if (search) {
          builder.where("title", "ilike", `%${search}%`);
        }
      })
      .select("*", Ticket.relatedQuery("comments").count().as("comments_count"))
      //   with count of comments
      .orderBy("created_at", "desc")
      .page(parseInt(page) - 1, parseInt(limit));

    res.json({
      results: result?.results,
      total: result?.total,
      page: page,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};

const detailPublishTickets = async (req, res) => {
  try {
    const { id } = req?.query;

    const result = await Ticket.query()
      .where({ is_published: true, id })
      .select("*", Ticket.relatedQuery("comments").count().as("comments_count"))
      .withGraphFetched("[customer(simpleSelect) ]")
      .first();

    const comments = await Comments.query()
      .where({ ticket_id: id })
      .withGraphFetched("user(simpleSelect)")
      .orderBy("created_at", "asc");

    const isSubscribe = await Subscriptions.query().where({
      ticket_id: id,
      user_id: req?.user?.customId,
    });

    const histories = await TicketHistories.query()
      .where({ ticket_id: id })
      .withGraphFetched("user(simpleSelect)");

    const participants = uniqBy(comments, "user_id").map((item) => item?.user);

    const dataAddition = [
      ...serializeComments(comments),
      ...serializeHistories(histories),
    ].sort((a, b) => {
      return new Date(a.created_at) - new Date(b.created_at);
    });

    const data = {
      ...result,
      data: serializeData(dataAddition),
      is_subscribe: isSubscribe.length > 0,
      participants,
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};

const subscribe = async (req, res) => {
  try {
    const { id } = req?.query;
    const {
      user: { customId: user_id },
    } = req;

    const ticket = await Ticket.query().findById(id);
    if (!ticket) {
      res.status(404).json({ message: "Ticket not found." });
    } else {
      await TicketsSubscriptions.query().insert({
        user_id,
        ticket_id: id,
      });
      res.status(200).json({ message: "Subscribed successfully." });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};

const unsubscribe = async (req, res) => {
  const { id } = req?.query;
  const {
    user: { customId: user_id },
  } = req;
  const ticket = await Ticket.query().findById(id);

  if (!ticket) {
    res.status(404).json({ message: "Ticket not found." });
  } else {
    await TicketsSubscriptions.query()
      .delete()
      .where({ user_id, ticket_id: id });
    res.status(200).json({ message: "Unsubscribed successfully." });
  }
};

const pinned = async (req, res) => {
  const { id } = req?.query;
  const {
    user: { customId: user_id },
  } = req;

  const ticket = await Ticket.query().findById(id);

  // max 3 pinned tickets
  const pinnedTickets = await Ticket.query().where({ is_pinned: true });
  if (!ticket) {
    res.status(404).json({ message: "Ticket not found." });
  } else {
    if (pinnedTickets.length >= 3) {
      res.status(400).json({ message: "You can only pin 3 tickets." });
    } else {
      await Ticket.query().patch({ is_pinned: true }).where({ id });
      await insertTicketHistory(
        id,
        user_id,
        "pinned",
        "menandai tiket ini sebagai penting"
      );
      // should be added to the ticket history
      res.status(200).json({ message: "Ticket pinned successfully." });
    }
  }
};

const unPinned = async (req, res) => {
  try {
    const { id } = req?.query;
    const {
      user: { customId: user_id },
    } = req;

    const ticket = await Ticket.query().findById(id);

    if (!ticket) {
      res.status(404).json({ message: "Ticket not found." });
    } else {
      await Ticket.query().patch({ is_pinned: false }).where({ id });
      await insertTicketHistory(
        id,
        user_id,
        "unpinned",
        "menghapus tanda penting pada tiket ini"
      );
      // should be added to the ticket history
      res.status(200).json({ message: "Ticket unpinned successfully." });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};

const reactions = async (req, res) => {
  try {
    const { id } = req?.query;
    const {
      user: { customId: user_id },
    } = req;

    const ticket = await Ticket.query().findById(id);

    if (!ticket) {
      res.status(404).json({ message: "Ticket not found." });
    } else {
      const { reaction } = req.body;
      await TicketsReactions.query().insert({
        user_id,
        ticket_id: id,
        reaction,
      });
      res.status(200).json({ message: "Reactions added successfully." });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};

const unReactions = async (req, res) => {
  try {
    const { id } = req?.query;
    const {
      user: { customId: user_id },
    } = req;

    const ticket = await Ticket.query().findById(id);

    if (!ticket) {
      res.status(404).json({ message: "Ticket not found." });
    } else {
      const { reaction } = req.body;
      await TicketsReactions.query()
        .delete()
        .where({ user_id, ticket_id: id, reaction });
      res.status(200).json({ message: "Reactions removed successfully." });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};

const lockConversation = async (req, res) => {
  try {
    const { id } = req?.query;
    const {
      user: { customId: user_id },
    } = req;

    const ticket = await Ticket.query().findById(id);

    if (!ticket) {
      res.status(404).json({ message: "Ticket not found." });
    } else {
      await Ticket.query().patch({ is_locked: true }).where({ id });
      await insertTicketHistory(
        id,
        user_id,
        "locked",
        "Mengunci dan membatasi tanggapan dari pengguna lain"
      );
      // should be added to the ticket history
      res.status(200).json({ message: "Ticket locked successfully." });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};

const unLockConversation = async (req, res) => {
  try {
    const { id } = req?.query;
    const {
      user: { customId: user_id },
    } = req;

    const ticket = await Ticket.query().findById(id);

    if (!ticket) {
      res.status(404).json({ message: "Ticket not found." });
    } else {
      await Ticket.query().patch({ is_locked: false }).where({ id });
      await insertTicketHistory(
        id,
        user_id,
        "unlocked",
        "Membuka kembali tanggapan dari pengguna lain"
      );
      // should be added to the ticket history
      res.status(200).json({ message: "Ticket unlocked successfully." });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};

const publish = async (req, res) => {
  try {
    const { id } = req?.query;
    const {
      user: { customId: user_id },
    } = req;

    const ticket = await Ticket.query().findById(id);

    if (!ticket) {
      res.status(404).json({ message: "Ticket not found." });
    } else {
      await Ticket.query().patch({ is_published: true }).where({ id });
      await insertTicketHistory(id, user_id, "published", "Ticket published");
      // should be added to the ticket history
      res.status(200).json({ message: "Ticket published successfully." });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};

const unPublish = async (req, res) => {
  try {
    const { id } = req?.query;
    const {
      user: { customId: user_id },
    } = req;

    const ticket = await Ticket.query().findById(id);

    if (!ticket) {
      res.status(404).json({ message: "Ticket not found." });
    } else {
      await Ticket.query().patch({ is_published: false }).where({ id });
      await insertTicketHistory(
        id,
        user_id,
        "unpublished",
        "Ticket unpublished"
      );
      // should be added to the ticket history
      res.status(200).json({ message: "Ticket unpublished successfully." });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};

// comments crud
const createComments = async (req, res) => {
  try {
    const { id: ticket_id } = req?.query;
    const { customId: user_id } = req?.user;

    const comment = req?.body?.comment;

    const data = {
      comment,
      user_id,
      ticket_id,
    };

    await Comments.query().insert(data);
    res.json({ message: "Comment added successfully." });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};

const removeComments = async (req, res) => {
  try {
    const { id, commentId } = req?.query;
    const { customId: userId, current_role: role } = req?.user;

    const currentComment = await Comments.query().findOne({
      id: commentId,
    });

    if (role === "admin") {
      if (currentComment.user_id !== userId) {
        await Comments.query()
          .patch({ comment: "_Komentar dihapus oleh admin_" })
          .where({ id: commentId, ticket_id: id });

        await insertTicketHistory(
          id,
          userId,
          "comment_deleted",
          "Admin menghapus komentar orang lain"
        );
      } else {
        await Comments.query()
          .delete()
          .where({ id: commentId, ticket_id: id, user_id: userId });
      }
    } else {
      await Comments.query()
        .delete()
        .where({ id: commentId, ticket_id: id, user_id: userId });
    }
    res.status(200).json({ message: "Comment deleted successfully." });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};

const updateComments = async (req, res) => {
  try {
    const { id, commentId } = req?.query;
    const { customId: userId, current_role: role } = req?.user;
    const { comment } = req?.body;

    const currentComment = await Comments.query().findOne({
      id: commentId,
    });

    if (role === "admin") {
      if (currentComment.user_id !== userId) {
        await Comments.query()
          .patch({
            comment,
          })
          .where({ id: commentId, ticket_id: id });
        await insertTicketHistory(
          id,
          userId,
          "comment_updated",
          "Admin mengubah komentar orang lain"
        );
      } else {
        await Comments.query()
          .patch({
            comment,
          })
          .where({ id: commentId, ticket_id: id, user_id: userId });
      }
    } else {
      await Comments.query()
        .patch({
          comment,
        })
        .where({ id: commentId, ticket_id: id, user_id: userId });
    }
    res.status(200).json({ message: "Comment updated successfully." });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};

const removeTicket = async (req, res) => {
  try {
    const { id } = req?.query;
    const { current_role, customId } = req?.user;

    if (!current_role !== "admin") {
      res
        .status(403)
        .json({ message: "You don't have permission to do this action." });
    } else {
      await Ticket.query().deleteById(id);
      await insertTicketHistory(id, customId, "deleted", "Ticket deleted");
      res.status(200).json({ message: "Ticket deleted successfully." });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};

const markAsAnswer = async (req, res) => {
  try {
    const { id, commentId } = req?.query;
    const {
      user: { customId: user_id },
    } = req;

    await Comments.query()
      .patch({ is_answer: true })
      .where({ id: commentId, ticket_id: id });
    await insertTicketHistory(
      id,
      user_id,
      "marked_as_answer",
      "Ticket marked as answer"
    );
    res.status(200).json({ message: "Ticket marked as answer successfully." });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};

const unMarkAsAnswer = async (req, res) => {
  try {
    const { id, commentId } = req?.query;
    const {
      user: { customId: user_id },
    } = req;

    await Comments.query()
      .patch({ is_answer: false })
      .where({ id: commentId, ticket_id: id });
    await insertTicketHistory(
      id,
      user_id,
      "unmarked_as_answer",
      "Ticket unmarked as answer"
    );
    res
      .status(200)
      .json({ message: "Ticket unmarked as answer successfully." });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};

module.exports = {
  markAsAnswer,
  unMarkAsAnswer,
  removeTicket,
  createComments,
  removeComments,
  updateComments,
  subscribe,
  unsubscribe,
  pinned,
  unPinned,
  reactions,
  unReactions,
  lockConversation,
  unLockConversation,
  publish,
  unPublish,
  publishedTickets,
  detailPublishTickets,
};
