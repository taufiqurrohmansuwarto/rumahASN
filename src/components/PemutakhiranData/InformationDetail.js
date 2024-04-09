import { dataUtamaSIASN } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Descriptions, Grid } from "antd";

function InformationDetail({ data }) {
  const breakPoint = Grid.useBreakpoint();
  return (
    <div>
      {/* {JSON.stringify(data)} */}
      <Descriptions
        column={{
          xs: 1,
          md: 4,
        }}
        title="Informasi MyASN"
        layout="vertical"
      >
        <Descriptions.Item label="Nama">{data?.nama}</Descriptions.Item>
        <Descriptions.Item label="NIP">{data?.nipBaru}</Descriptions.Item>
        <Descriptions.Item label="Status Pegawai">
          {data?.statusPegawai}
        </Descriptions.Item>
        <Descriptions.Item label="Tempat Lahir">
          {data?.tempatLahir}
        </Descriptions.Item>
        <Descriptions.Item label="Tanggal Lahir">
          {data?.tglLahir}
        </Descriptions.Item>
        <Descriptions.Item label="Email">{data?.email}</Descriptions.Item>
        <Descriptions.Item label="Email Gov">
          {data?.emailGov}
        </Descriptions.Item>
        <Descriptions.Item label="NIK">{data?.nik}</Descriptions.Item>
        <Descriptions.Item label="Alamat">{data?.alamat}</Descriptions.Item>
        <Descriptions.Item label="No. HP">{data?.noHp}</Descriptions.Item>
      </Descriptions>
    </div>
  );
}

export default InformationDetail;
