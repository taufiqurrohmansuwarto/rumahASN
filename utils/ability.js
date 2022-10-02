import { defineAbility } from "@casl/ability";

const ability = (role) => {
  return defineAbility((can, cannot) => {
    // there is 3 roles: admin, agent, user
    if (role === "admin") {
      can("manage", "all");
    } else if (role === "agent") {
      can("manage", "Tickets");
      can("manage", "Feeds");
    } else if (role === "user") {
      can("manage", "Feeds");
      can("manage", "Tickets");
    }
  });
};

export default ability;
