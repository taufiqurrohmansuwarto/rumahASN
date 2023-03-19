import moment from "moment";
import "moment/locale/id";
// language is set to Indonesia
moment.locale("id");

export const formatDateFromNow = (date) => {
  // language is set to Indonesia
  return moment(date).locale("id").fromNow();
};

export const formatDateLL = (data) => {
  //  return Sep, 24 2021
  return moment(data).format("DD, MMM YYYY", { locale: "id" });
};

const allUser = ["admin", "agent", "user"];
const noAdmin = ["agent", "user"];
const noUser = ["admin", "agent"];

const user = ["user"];
const agent = ["agent"];

export const definitions = {
  permissions: {
    "create-ticket": {
      roles: allUser,
      displayName: "Create Ticket",
      description: "To create new ticket",
    },
    "edit-comment": {
      roles: allUser,
      displayName: "Create Own Comment",
      description: "To create own comment",
      attributeCheck: {
        checkFunction: (attributes) => {
          return attributes?.user?.id === attributes?.comment?.user_id;
        },
        requiredRoles: noAdmin,
      },
    },
    "remove-comment": {
      roles: allUser,
      displayName: "Remove Own Comment",
      description: "To remove own comment",
      attributeCheck: {
        checkFunction: (attributes) =>
          attributes?.user?.id === attributes?.comment?.user_id,
        requiredRoles: noAdmin,
      },
    },
    "create-comment": {
      roles: allUser,
      displayName: "Create Own Comment",
      description: "To create own comment",
    },
    "mark-answer": {
      roles: noUser,
      displayName: "Mark Answer",
      description: "To mark answer",
      attributeCheck: {
        checkFunction: (attributes) => {
          return attributes?.user?.id === attributes?.agent?.custom_id;
        },
        requiredRoles: agent,
      },
    },
    "options-ticket": {
      roles: ["admin", "agent"],
      displayName: "Options Ticket",
      description: "To see options ticket",
      attributeCheck: {
        checkFunction: (attributes) => {
          return attributes?.user?.id === attributes?.ticket?.assignee;
        },
        requiredRoles: ["agent"],
      },
    },
    "update-feedback": {
      roles: allUser,
      displayName: "Update Feedback",
      description: "To update feedback",
      attributeCheck: {
        checkFunction: (attributes) =>
          attributes?.user?.id === attributes?.user_id,
        requiredRoles: user,
      },
    },
    "see-feedback": {
      roles: user,
      displayName: "See Feedback",
      description: "To see feedback",
    },
  },
};
