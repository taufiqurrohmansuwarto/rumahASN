import { defineAbility } from "@casl/ability";

const ability = (user) => {
  return defineAbility((can, cannot) => {
    if (user.role === "admin") {
      can("manage", "all");
    } else {
      can("read", "all");
    }
  });
};

export default ability;
