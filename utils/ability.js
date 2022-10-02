import { defineAbility } from "@casl/ability";

const ability = (user) => {
  return defineAbility((can, cannot) => {
    // there is 3 roles: admin, agent, user
    if (user.role === "admin") {
      can("manage", "all");
    } else if (user.role === "agent") {
      can("manage", "tickets");
      can("manage", "feeds");
    } else if (user.role === "user") {
      can("manage", "feeds");
      can("manage", "tickets");
    }
  });
};

export default ability;
