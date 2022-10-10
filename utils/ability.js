import { defineAbility } from "@casl/ability";

const ability = (user) => {
  const { current_role: role, id: userId, organization } = user;
  const bkd = organization?.startsWith("123");

  return defineAbility((can, cannot) => {
    // there is 3 roles: admin, agent, user
    if (role === "admin" && bkd) {
      can("manage", "all");
    } else if (role === "agent" && bkd) {
      can("manage", "Tickets");
      can("manage", "Feeds");
    } else if (role === "user") {
      can("manage", "Tickets");
      can("manage", "Feeds");
    }
  });
};

export default ability;
