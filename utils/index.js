import moment from "moment";

// change date format to DD-MM-YYYY
export const formatDate = (date) => {
  return moment(date).format("DD-MM-YYYY");
};

export const fromNow = (date) => {
  return moment(date).fromNow();
};
