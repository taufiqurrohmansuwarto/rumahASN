import axios from "axios";
import queryString from "query-string";

const userApi = axios.create({
  baseURL: "/helpdesk/api/users",
});

const coachingClinicApi = axios.create({
  baseURL: "/helpdesk/api/coaching-clinic",
});

export const alterUserCoach = (id) => {
  const url = `/${id}/coaching`;
  return userApi.put(url);
};

export const dropUserCoach = (id) => {
  const url = `/${id}/coaching`;
  return userApi.delete(url);
};

export const checkStatus = () => {
  const url = "/consultants/status";
  return coachingClinicApi.get(url).then((res) => res.data);
};

// consultant / instructor
export const createMeeting = (data) => {
  const url = "/consultants/meetings";
  return coachingClinicApi.post(url, data).then((res) => res?.data);
};

export const findMeeting = (params) => {
  const qs = queryString.stringify(params);
  const url = `/consultants/meetings?${qs}`;
  return coachingClinicApi.get(url).then((res) => res?.data);
};

export const updateMeeting = ({ id, data }) => {
  const url = `/consultants/meetings/${id}`;
  return coachingClinicApi.patch(url, data).then((res) => res?.data);
};

export const removeMeeting = (id) => {
  const url = `/consultants/meetings/${id}`;
  return coachingClinicApi.delete(url).then((res) => res?.data);
};

export const detailMeeting = (id) => {
  const url = `/consultants/meetings/${id}`;
  return coachingClinicApi.get(url).then((res) => res?.data);
};

export const startMeeting = (id) => {
  const url = `/consultants/meetings/${id}/live`;
  return coachingClinicApi.put(url).then((res) => res?.data);
};

export const endMeeting = (id) => {
  const url = `/consultants/meetings/${id}/live`;
  return coachingClinicApi.delete(url).then((res) => res?.data);
};

// participants
export const upcomingMeetings = (query) => {
  const qs = queryString.stringify(query, {
    skipNull: true,
  });
  const url = `/participants/upcoming?${qs}`;
  return coachingClinicApi.get(url).then((res) => res?.data);
};

export const searchMentoringByCode = (code) => {
  const url = `/participants/search-by-code?code=${code}`;
  return coachingClinicApi.get(url).then((res) => res?.data);
};

export const requestMeeting = ({ id, data }) => {
  const url = `/participants/meetings/${id}/request`;
  return coachingClinicApi.put(url, data).then((res) => res?.data);
};

export const cancelRequestMeeting = (id) => {
  const url = `/participants/meetings/${id}/request`;
  return coachingClinicApi.delete(url).then((res) => res?.data);
};

export const meetingsParticipant = (query) => {
  const qs = queryString.stringify(query, {
    skipNull: true,
  });

  const url = `/participants/me?${qs}`;
  return coachingClinicApi.get(url).then((res) => res?.data);
};

export const detailMeetingParticipant = (id) => {
  const url = `/participants/meetings/${id}`;
  return coachingClinicApi.get(url).then((res) => res?.data);
};

export const getRatingParticipant = (id) => {
  const url = `/participants/meetings/${id}/rating`;
  return coachingClinicApi.get(url).then((res) => res?.data);
};

export const giveRatingMeeting = ({ id, data }) => {
  const url = `/participants/meetings/${id}/rating`;
  return coachingClinicApi.put(url, data).then((res) => res?.data);
};

// tambah participants
export const addParticipant = ({ meetingId, data }) => {
  const url = `/consultants/meetings/${meetingId}/participants`;
  return coachingClinicApi.post(url, data).then((res) => res?.data);
};

export const removeParticipant = ({ meetingId, participantId }) => {
  const url = `/consultants/meetings/${meetingId}/participants/${participantId}`;
  return coachingClinicApi.delete(url).then((res) => res?.data);
};

export const ratingMeetingConsultant = async (id) => {
  const url = `/consultants/meetings/${id}/rating`;
  return coachingClinicApi.get(url).then((res) => res?.data);
};

// ==========================================
// VIDEO SESSION MANAGEMENT (Persistence)
// ==========================================

/**
 * Cek apakah user punya active video session
 * Digunakan saat login/refresh untuk auto-resume
 */
export const getActiveVideoSession = () => {
  const url = "/sessions/active";
  return coachingClinicApi.get(url).then((res) => res?.data);
};

/**
 * Buat video session saat join/start meeting
 * @param {Object} data - { meetingId: string, role: 'consultant' | 'participant' }
 */
export const createVideoSession = (data) => {
  const url = "/sessions/join";
  return coachingClinicApi.post(url, data).then((res) => res?.data);
};

/**
 * End video session saat leave meeting (participant)
 * @param {string} meetingId
 */
export const endVideoSession = (meetingId) => {
  const url = "/sessions/end";
  return coachingClinicApi.post(url, { meetingId }).then((res) => res?.data);
};

/**
 * End all sessions for a meeting (consultant only - when ending meeting)
 * @param {string} meetingId
 */
export const endAllMeetingVideoSessions = (meetingId) => {
  const url = "/sessions/end-all";
  return coachingClinicApi.post(url, { meetingId }).then((res) => res?.data);
};

/**
 * Update heartbeat untuk keep session alive
 * @param {string} meetingId
 */
export const heartbeatVideoSession = (meetingId) => {
  const url = "/sessions/heartbeat";
  return coachingClinicApi.post(url, { meetingId }).then((res) => res?.data);
};

/**
 * Cek apakah user punya active session (untuk prevent multiple meetings)
 */
export const checkUserHasActiveSession = () => {
  const url = "/sessions/check-active";
  return coachingClinicApi.get(url).then((res) => res?.data);
};

// ==========================================
// NOTULA / REKAP DISKUSI MANAGEMENT
// ==========================================

/**
 * Get notula untuk meeting
 * @param {string} meetingId
 */
export const getNotula = (meetingId) => {
  const url = `/consultants/meetings/${meetingId}/notula`;
  return coachingClinicApi.get(url).then((res) => res?.data);
};

/**
 * Update/simpan notula
 * @param {string} meetingId
 * @param {string} notula - konten notula
 */
export const updateNotula = (meetingId, notula) => {
  const url = `/consultants/meetings/${meetingId}/notula`;
  return coachingClinicApi.patch(url, { notula }).then((res) => res?.data);
};

/**
 * Kirim notula ke semua peserta via rasn_mail
 * @param {string} meetingId
 * @param {string} subject - optional custom subject
 */
export const sendNotulaToParticipants = (meetingId, subject) => {
  const url = `/consultants/meetings/${meetingId}/notula`;
  return coachingClinicApi.post(url, { subject }).then((res) => res?.data);
};

/**
 * Rapikan notula dengan AI
 * @param {string} meetingId
 * @param {string} text - teks yang akan dirapikan
 */
export const refineNotula = (meetingId, text) => {
  const url = `/consultants/meetings/${meetingId}/notula-refine`;
  return coachingClinicApi.post(url, { text }).then((res) => res?.data);
};
