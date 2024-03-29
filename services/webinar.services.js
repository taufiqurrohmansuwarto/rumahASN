import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/webinar-series",
});

// all
export const allWebinars = (query) => {
  const queryStr = queryString.stringify(query);
  return api.get(`/all?${queryStr}`).then((res) => res?.data);
};

// admin
export const createWebinar = (data) => {
  return api.post(`/admin`, data).then((res) => res?.data);
};

export const getParticipants = ({ id, query }) => {
  const queryStr = queryString.stringify(query);
  return api
    .get(`/admin/${id}/participants?${queryStr}`)
    .then((res) => res?.data);
};

// redownload certificate participant
export const redownloadCertificateParticipant = ({ id, participantId }) => {
  return api
    .delete(`/admin/${id}/participants/${participantId}/certificate`)
    .then((res) => res?.data);
};

export const detailWebinar = (id) => {
  return api.get(`/admin/${id}`).then((res) => res?.data);
};

export const readAllWebinar = (query) => {
  const queryStr = queryString.stringify(query);
  return api.get(`/admin?${queryStr}`).then((res) => res?.data);
};

export const updateWebinar = ({ id, data }) => {
  return api.patch(`/admin/${id}`, data).then((res) => res?.data);
};

export const removeWebinar = (id) => {
  return api.delete(`/admin/${id}`).then((res) => res?.data);
};

// crud absence entries
export const absenceEntries = (id) => {
  return api.get(`/admin/${id}/absence-entries`).then((res) => res?.data);
};

export const createAbsenceEntries = ({ id, data }) => {
  return api
    .post(`/admin/${id}/absence-entries`, data)
    .then((res) => res?.data);
};

export const updateAbsenceEntries = ({ id, absenceId, data }) => {
  return api
    .patch(`/admin/${id}/absence-entries/${absenceId}`, data)
    .then((res) => res?.data);
};

export const deleteAbsenceEntries = ({ id, absenceId }) => {
  return api
    .delete(`/admin/${id}/absence-entries/${absenceId}`)
    .then((res) => res?.data);
};

export const downloadAbsences = ({ id, absenceId }) => {
  return api
    .get(`/admin/${id}/absence-entries/${absenceId}/download`, {
      responseType: "arraybuffer",
    })
    .then((res) => res?.data);
};

export const detailAllWebinar = (id) => {
  return api.get(`/all/${id}`).then((res) => res?.data);
};

export const detailWebinarUser = (id) => {
  return api.get(`/${id}`).then((res) => res?.data);
};

export const registerWebinar = ({ id, data }) => {
  return api.patch(`/all/${id}/participates`, data).then((res) => res?.data);
};

export const unregisterWebinar = (id) => {
  return api.delete(`/all/${id}/participates`).then((res) => res?.data);
};

export const uploadFileWebinar = ({ id, data }) => {
  return api
    .post(`/admin/${id}/upload`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res?.data);
};

// user webinar
export const webinarUser = async (query) => {
  const queryStr = queryString.stringify(query);
  return api.get(`/users?${queryStr}`).then((res) => res?.data);
};

export const webinarUserDetail = async (id) => {
  return api.get(`/users/${id}`).then((res) => res?.data);
};

export const downloadCurrentUserCertificate = async (id) => {
  return api.get(`/users/${id}/download`).then((res) => res?.data);
};

export const createRating = ({ id, data }) => {
  return api.post(`/users/${id}/rating`, data).then((res) => res?.data);
};

export const getRatingForUser = (query) => {
  const queryStr = queryString.stringify(query, {
    skipEmptyString: true,
  });

  return api
    .get(`/users/${query?.id}/rating?${queryStr}`)
    .then((res) => res?.data);
};

// surveys admin
export const createSurvey = (data) => {
  return api.post(`/admin/surveys`, data).then((res) => res?.data);
};

export const readAllSurvey = (query) => {
  const queryStr = queryString.stringify(query);
  return api.get(`/admin/surveys?${queryStr}`).then((res) => res?.data);
};

export const detailSurvey = (id) => {
  return api.get(`/admin/surveys/${id}`).then((res) => res?.data);
};

export const updateSurvey = ({ id, data }) => {
  return api.patch(`/admin/surveys/${id}`, data).then((res) => res?.data);
};

export const deleteSurvey = (id) => {
  return api.delete(`/admin/surveys/${id}`).then((res) => res?.data);
};

export const getRatingAdmin = (query) => {
  const queryStr = queryString.stringify(query, {
    skipEmptyString: true,
  });

  return api
    .get(`/admin/${query?.id}/ratings?${queryStr}`)
    .then((res) => res?.data);
};

// comments
export const commentAdminIndex = (id) => {
  return api.get(`/admin/${id}/comments`).then((res) => res?.data);
};

export const commentAdminCreate = ({ id, data }) => {
  return api.post(`/admin/${id}/comments`, data).then((res) => res?.data);
};

export const commentAdminUpdate = ({ id, commentId, data }) => {
  return api
    .patch(`/admin/${id}/comments/${commentId}`, data)
    .then((res) => res?.data);
};

export const commentAdminDelete = ({ id, commentId }) => {
  return api
    .delete(`/admin/${id}/comments/${commentId}`)
    .then((res) => res?.data);
};

export const resetCertificates = (id) => {
  return api.delete(`/admin/${id}/certificates`).then((res) => res?.data);
};

// end of admin

// surveys user
export const readAllSurveyUser = (id) => {
  return api.get(`/users/${id}/surveys`).then((res) => res?.data);
};

export const submitSurveys = ({ id, data }) => {
  return api.post(`/users/${id}/surveys`, data).then((res) => res?.data);
};

// absences for users
export const getAbsenceUsers = (id) => {
  return api.get(`/users/${id}/absences`).then((res) => res?.data);
};

export const registerAbsence = ({ id, absenceId }) => {
  return api
    .patch(`/users/${id}/absences/${absenceId}`)
    .then((res) => res?.data);
};

export const unregisterAbsence = ({ id, absenceId }) => {
  return api
    .delete(`/users/${id}/absences/${absenceId}`)
    .then((res) => res?.data);
};

// comments
export const commentUserIndex = (id) => {
  return api.get(`/users/${id}/comments`).then((res) => res?.data);
};

export const commentUserCreate = ({ id, data }) => {
  return api.post(`/users/${id}/comments`, data).then((res) => res?.data);
};

export const commentUserUpdate = ({ id, commentId, data }) => {
  return api
    .patch(`/users/${id}/comments/${commentId}`, data)
    .then((res) => res?.data);
};

export const commentUserDelete = ({ id, commentId }) => {
  return api
    .delete(`/users/${id}/comments/${commentId}`)
    .then((res) => res?.data);
};

export const unregisterUserWebinar = (id) => {
  return api.delete(`/users/${id}/registers`).then((res) => res?.data);
};

// user information
export const updateUserInformation = ({ id, data }) => {
  return api
    .patch(`/users/${id}/user-information`, data)
    .then((res) => res?.data);
};

// report
export const downloadParticipants = (id) => {
  return api
    .get(`/admin/${id}/participants/download`, {
      responseType: "arraybuffer",
    })
    .then((res) => res?.data);
};

export const downloadSurvey = (id) => {
  return api
    .get(`/admin/${id}/surveys/download`, {
      responseType: "arraybuffer",
    })
    .then((res) => res?.data);
};

export const downloadComments = (id) => {
  return api
    .get(`/admin/${id}/comments/download`, {
      responseType: "arraybuffer",
    })
    .then((res) => res?.data);
};

// pretest
export const findPretest = (id) => {
  return api.get(`/admin/${id}/pretests`).then((res) => res?.data);
};

export const createPretest = ({ id, data }) => {
  return api.post(`/admin/${id}/pretests`, data).then((res) => res?.data);
};

export const getPretest = ({ id, pretestId }) => {
  return api.get(`/admin/${id}/pretests/${pretestId}`).then((res) => res?.data);
};

export const updatePretest = ({ id, pretestId, data }) => {
  return api
    .patch(`/admin/${id}/pretests/${pretestId}`, data)
    .then((res) => res?.data);
};

export const removePretest = ({ id, pretestId }) => {
  return api
    .delete(`/admin/${id}/pretests/${pretestId}`)
    .then((res) => res?.data);
};

export const downloadRatings = (id) => {
  return api
    .get(`/admin/${id}/ratings/download`, {
      responseType: "arraybuffer",
    })
    .then((res) => res?.data);
};

export const reportSurvey = (id) => {
  return api.get(`/admin/${id}/surveys`).then((res) => res?.data);
};

export const viewCertificate = (id) => {
  return api.get(`/admin/${id}/view-certificate`).then((res) => res?.data);
};

export const editTemplateCertificate = ({ id, data }) => {
  return api
    .patch(`/admin/${id}/view-certificate`, data)
    .then((res) => res?.data);
};

export const getSettingTemplate = (id) => {
  return api
    .get(`/admin/${id}/setting-template-certificate`)
    .then((res) => res?.data);
};

export const editSettingTemplate = ({ id, data }) => {
  return api
    .patch(`/admin/${id}/setting-template-certificate`, data)
    .then((res) => res?.data);
};

// public
export const checkCertificateWebinar = (id) => {
  return api.get(`/public/${id}`).then((res) => res?.data);
};
