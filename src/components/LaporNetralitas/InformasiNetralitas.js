import { Descriptions } from "antd";
import React from "react";

import dayjs from "dayjs";

dayjs.locale("id");
require("dayjs/locale/id");

function InformasiNetralitas({ data }) {
  return (
    <Descriptions layout="vertical" title="Informasi Laporan" bordered>
      <Descriptions.Item label="Kode Laporan">
        {data?.kode_laporan}
      </Descriptions.Item>
      <Descriptions.Item label="Nama Pelapor">
        {data?.nama_pelapor}
      </Descriptions.Item>
      <Descriptions.Item label="NIP Pelapor">
        {data?.nip_pelapor}
      </Descriptions.Item>
      <Descriptions.Item label="Email Pelapor">
        {data?.email_pelapor}
      </Descriptions.Item>
      <Descriptions.Item label="Nomor Telepon Pelapor">
        {data?.no_hp_pelapor}
      </Descriptions.Item>
      <Descriptions.Item label="Alamat Pelapor">
        {data?.alamat_pelapor}
      </Descriptions.Item>
      <Descriptions.Item label="Jabatan/Instansi Pelapor" span={3}>
        {data?.jabatan_instansi_pelapor}
      </Descriptions.Item>
      <Descriptions.Item label="Nama Terlapor">
        {data?.nama_terlapor}
      </Descriptions.Item>
      <Descriptions.Item label="NIP Terlapor">
        {data?.nip_terlapor}
      </Descriptions.Item>
      <Descriptions.Item label="Jabatan/Instansi Terlapor">
        {data?.jabatan_instansi_terlapor}
      </Descriptions.Item>
      <Descriptions.Item label="Isi Laporan" span={3}>
        {data?.laporan}
      </Descriptions.Item>
      <Descriptions.Item label="Lampiran" span={3}>
        {data?.files?.map((file) => {
          const current = JSON.parse(file);
          return (
            <div key={file?.name}>
              <a target="_blank" rel="noreferrer" href={current?.url}>
                {current?.name}
              </a>
            </div>
          );
        })}
      </Descriptions.Item>
      <Descriptions.Item label="Status">{data?.status}</Descriptions.Item>
      <Descriptions.Item label="Tanggal Laporan">
        {dayjs(data?.created_at).format("DD MMMM YYYY HH:mm:ss")}
      </Descriptions.Item>
    </Descriptions>
  );
}

export default InformasiNetralitas;
