import moment from "moment";
export const formatDateFromNow = (date) => {
  return moment(date).fromNow();
};
