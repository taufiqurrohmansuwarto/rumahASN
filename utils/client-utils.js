import moment from "moment";
// language is set to Indonesia
moment.locale("id");

export const formatDateFromNow = (date) => {
  // language is set to Indonesia
  return moment(date).locale("id").fromNow();
};
