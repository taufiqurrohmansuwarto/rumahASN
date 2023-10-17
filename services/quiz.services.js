import axios from "axios";

const api = axios.create({
  baseURL: "/helpdesk/api/quiz",
});

export const getScore = () => {
  return api.get("/user/score").then((res) => res.data);
};

export const getUserQuiz = () => {
  return api.get("/user").then((res) => res.data);
};

export const answerQuiz = ({ id, data }) => {
  return api.patch(`/user/${id}`, data).then((res) => res.data);
};

export const getLeaderBoard = () => {
  return api.get("/leaderboard").then((res) => res.data);
};
