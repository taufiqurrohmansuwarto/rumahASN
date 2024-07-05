import { inboxUsulan, refJenisRiwayat } from "@/services/siasn-services";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Select, Space } from "antd";
import { useState } from "react";
import TableUsulan from "./TableUsulan";

function RwInboxUsulan() {
  const [dataInbox, setDataInbox] = useState(null);
  const { data, isLoading } = useQuery(
    ["ref-jenis-riwayat-siasn"],
    refJenisRiwayat,
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: dataUsulan, isFetching: isLoadingUsulan } = useQuery(
    ["inbox-usulan-layanan", dataInbox],
    () => inboxUsulan(dataInbox),
    {
      enabled: Boolean(dataInbox),
      refetchOnWindowFocus: false,
      // staleTime: 1000 * 60 * 5,
    }
  );

  return (
    <Stack>
      <Space>
        {data && (
          <Select
            showSearch
            allowClear
            value={dataInbox}
            onChange={setDataInbox}
            style={{ width: 350 }}
            optionFilterProp="label"
            placeholder="Pilih Jenis Usulan"
            options={data?.map((item) => ({
              label: item.nama,
              value: item.id,
            }))}
          />
        )}
      </Space>
      <TableUsulan data={dataUsulan} isLoading={isLoadingUsulan} />
    </Stack>
  );
}

export default RwInboxUsulan;
