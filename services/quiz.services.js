import axios from "axios";

const api = axios.create({
  baseURL: "/helpdesk/api/quiz",
});

export const getUserQuiz = () => {
  return api.get("/user").then((res) => res.data);
};

export const answerQuiz = ({ id, data }) => {
  return api.patch(`/user/${id}`, data).then((res) => res.data);
};
