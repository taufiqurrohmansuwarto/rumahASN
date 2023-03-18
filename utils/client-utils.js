import moment from "moment";
import "moment/locale/id";
// language is set to Indonesia
moment.locale("id");

export const formatDateFromNow = (date) => {
  // language is set to Indonesia
  return moment(date).locale("id").fromNow();
};

export const formatDateLL = (data) => {
  //  return Sep, 24 2021
  return moment(data).format("DD, MMM YYYY", { locale: "id" });
};
