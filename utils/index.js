import moment from "moment";

// change date format to DD-MM-YYYY
export const formatDate = (date) => {
  return moment(date).format("DD-MM-YYYY hh:mm:ss");
};

export const fromNow = (date) => {
  return moment(date).fromNow();
};

// add image height and width from image tag and scale to 0.3
export const resizeImage = (text) => {
  return text.replace(/<img/g, '<img style="width: 30%; height: 30%"');
};

// convert html to text
export const removeHtmlTags = (text) => {
  return text.replace(/<[^>]*>?/gm, "");
};
