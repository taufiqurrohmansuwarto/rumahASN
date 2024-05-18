import React, { useState } from "react";
import { Form, Select, Space, Spin } from "antd";
import { useQuery } from "@tanstack/react-query";
import { trackingLayananSIASN } from "@/services/siasn-services";
import TableUsulan from "@/components/RiwayatUsulan/TableUsulan";

const layananType = [
  { name: "Kenaikan Pangkat", id: "kenaikan-pangkat" },
  { name: "Pemberhentian", id: "pemberhentian" },
  { name: "Perbaikan Nama", id: "skk" },
  { name: "Pencantuman Gelar", id: "pg" },
  { name: "Penyesuaian Masa Kerja", id: "pmk" },
];

function SiasnTrackingLayanan({ nip }) {
  const [tipeLayanan, setTipeLayanan] = useState();

  const { data, isLoading, refetch } = useQuery(
    [`layanan-siasn`, nip, tipeLayanan],
    () => trackingLayananSIASN({ tipeUsulan: tipeLayanan, nip }),
    {
      enabled: !!tipeLayanan,
      refetchOnWindowFocus: false,
    }
  );

  return (
    <>
      <Space direction="vertical" size={10}>
        <Select
          style={{
            width: "80%",
          }}
          showSearch
          optionFilterProp="tipe"
          allowClear
          value={tipeLayanan}
          onSelect={(value) => setTipeLayanan(value)}
          loading={isLoading}
        >
          {layananType.map((item) => (
            <Select.Option tipe={item.name} key={item.id} value={item.id}>
              {item.name}
            </Select.Option>
          ))}
        </Select>
        <Spin spinning={isLoading}>
          <TableUsulan isLoading={isLoading} data={data} />
        </Spin>
      </Space>
    </>
  );
}

export default SiasnTrackingLayanan;
