import { defineAbility } from "@casl/ability";

const ability = (user) => {
  const { role } = user;
  return defineAbility((can, cannot) => {
    // there is 3 roles: admin, agent, user
    if (role === "admin") {
      can("manage", "all");
    } else if (role === "agent") {
      can("manage", "Tickets");
      can("manage", "Feeds");
    } else if (role === "user") {
      can(
        "manage",
        "Tickets",
        { user_id: req.user.userId },
        { status: "open" }
      );
      can("manage", "Feeds");
    }
  });
};

export default ability;
