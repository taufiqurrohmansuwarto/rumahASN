import { defineAbility } from "@casl/ability";

const ability = (user) => {
  const { current_role: role, id: userId, organization } = user;
  // harusnya ditambahkan kalau dia berasal dari master
  const bkd = organization?.startsWith("123");
  const pttBkd = organization?.startsWith("134");

  const admin = (role === "admin" && bkd) || (role === "admin" && pttBkd);
  const agent = (role === "agent" && bkd) || (role === "agent" && pttBkd);
  const userRole = role === "user" || (role === "user" && pttBkd);

  return defineAbility((can, cannot) => {
    // there is 3 roles: admin, agent, user
    if (admin) {
      can("manage", "all");
      can("manage", "Comment", { user_id: userId });
      can("read", "DashboardAdmin");
    } else if (agent) {
      can("manage", "Comment", { user_id: userId });
      can("update", "CustomerTicket", { assignee: userId });
      cannot(
        "create",
        "Comment",
        ({ customerTicket }) => customerTicket.is_locked
      );
      can("manage", "Tickets");
      can("manage", "Feeds");
      can("read", "DashboardAgent");
    } else if (userRole) {
      can("manage", "Comment", { user_id: userId });
      cannot("create", "Comment", ({ is_locked }) => is_locked);
      can("update", "CustomerTicket", { requester: userId });
      can("manage", "Comment", { user_id: userId });
      can("manage", "Tickets");
      can("manage", "Feeds");
    }
  });
};

export default ability;
