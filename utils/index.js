import moment from "moment";

// change date format to DD-MM-YYYY
export const formatDate = (date) => {
  return moment(date).format("DD-MM-YYYY hh:mm:ss");
};

export const fromNow = (date) => {
  return moment(date).fromNow();
};
