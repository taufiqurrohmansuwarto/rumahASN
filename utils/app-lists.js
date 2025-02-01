import { getUserType } from "./appLists";

const BASE_URL = "/helpdesk";

export const appList = (user) => {
  const { filteredApps } = getUserType(user);

  const apps = filteredApps.map((app) => ({
    ...app,
    url: `${BASE_URL}${app.url}`,
  }));

  return apps;
};
