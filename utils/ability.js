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

    // use extends
    if (admin) {
      can("manage", "all");
      can("read", "DashboardAdmin");
    } else if (agent) {
      can("manage", "Tickets");
      can("manage", "Feeds");
      can("read", "DashboardAgent");
    } else if (userRole) {
      can("manage", "Tickets");
      can("manage", "Feeds");
    }
  });
};

export default ability;
