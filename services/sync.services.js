import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/admins/sync",
});

export const syncPegawaiMaster = () => {
    return api.get('/pegawai').then((res) => res.data);
}

