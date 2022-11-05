import moment from "moment";
import axios from "axios";

// change date format to DD-MM-YYYY
export const formatDate = (date) => {
  return moment(date).format("DD-MM-YYYY HH:mm:ss");
};

export const uploadFileMinio = (mc, fileBuffer, filename, size, mimetype) => {
  return new Promise((resolve, reject) => {
    mc.putObject(
      "public",
      `${filename}`,
      fileBuffer,
      size,
      // cant be metadata add some username and department?
      { "Content-Type": mimetype },
      function (err, info) {
        if (err) {
          reject(err);
          console.log(error);
        } else {
          resolve(info);
        }
      }
    );
  });
};

// calculate time difference between two dates

export const timeDifference = (date1, date2) => {
  const diff = moment(date1).diff(moment(date2));
  const duration = moment.duration(diff);
  const hours = duration.asHours();
  const minutes = duration.asMinutes();
  const seconds = duration.asSeconds();
  const days = duration.asDays();
  const months = duration.asMonths();
  const years = duration.asYears();

  if (years >= 1) {
    return `${Math.floor(years)} tahun`;
  } else if (months >= 1) {
    return `${Math.floor(months)} bulan`;
  } else if (days >= 1) {
    return `${Math.floor(days)} hari`;
  } else if (hours >= 1) {
    return `${Math.floor(hours)} jam`;
  } else if (minutes >= 1) {
    return;
  } else if (seconds >= 1) {
    return `${Math.floor(seconds)} detik`;
  }
};

export const fromNow = (date) => {
  return moment(date).fromNow();
};

// add image height and width from image tag and scale to 0.3 and add breakline after image with <br />
export const resizeImageTag = (text) => {
  return text.replace(/<img/g, '<img style="width: 30%; height: 30%" /><br />');
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
