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

export const colorTag = (tag) => {
  switch (tag) {
    case "DIAJUKAN":
      return "yellow";
    case "DIKERJAKAN":
      return "blue";
    case "SELESAI":
      return "green";
    default:
      return "red";
  }
};

export const setActivePekerjaan = (data) => {
  if (data?.created_at && data?.start_work_at && data?.completed_at) {
    return 2;
  } else if (data?.created_at && data?.start_work_at) {
    return 1;
  } else {
    return 0;
  }
};
