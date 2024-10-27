import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/assistant",
});

export const sendMessagesAI = (params) => {
  const queryParams = queryString.stringify(params, {
    skipNull: true,
  });

  return api
    .post(`/bot?${queryParams}`, {
      responseType: "arraybuffer",
    })
    .then((res) => res?.data);
};
