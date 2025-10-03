import axios from "axios";

const api = axios.create({
  baseURL: "/helpdesk/api/public",
});

export const verifyPdfService = (data) => {
  return api.post(`/verify-pdf`, data).then((res) => res?.data);
};

export const checkMejaVerif = (noPeserta) => {
  return api.get(`/meja-registrasi/${noPeserta}`).then((res) => res?.data);
};

export const cekPertekService = (data) => {
  return api.post(`/casn/cek-pertek`, data).then((res) => res?.data);
};

export const checkQRDocumentService = (documentCode) => {
  return api
    .get(`/check-qr/esign/${documentCode}`)
    .then((res) => res?.data?.data);
};

export const verifyPdfServicePublic = (data) => {
  return api.post(`/verify-pdf`, data).then((res) => res?.data);
};
