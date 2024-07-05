import { inboxUsulanByNip, refJenisRiwayat } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Button, Select, Space } from "antd";
import TableUsulan from "./TableUsulan";
import { useState } from "react";
import { Stack } from "@mantine/core";

function RefJenisUsulan({ nip }) {
  const [dataInbox, setDataInbox] = useState(null);
  const { data, isLoading } = useQuery(
    ["ref-jenis-riwayat-siasn"],
    () => refJenisRiwayat(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const {
    data: dataUsulan,
    isFetching: isLoadingUsulan,
    refetch: refetchUsulan,
  } = useQuery(
    ["inbox-layanan", nip, dataInbox],
    () => inboxUsulanByNip({ nip, layananId: dataInbox }),
    {
      enabled: false,
      refetchOnWindowFocus: false,
    }
  );

  const handleSubmit = () => {
    refetchUsulan();
  };

  return (
    <>
      {data && (
        <>
          <Stack>
            <Space>
              {dataUsulan && (
                <Select
                  showSearch
                  allowClear
                  value={dataInbox}
                  onChange={(value) => setDataInbox(value)}
                  style={{ width: 350 }}
                  optionFilterProp="label"
                  placeholder="Pilih Jenis Usulan"
                  options={data?.map((item) => ({
                    label: item?.nama,
                    value: item?.id,
                  }))}
                />
              )}
              <Button
                loading={isLoadingUsulan}
                type="primary"
                htmlType="submit"
                onClick={handleSubmit}
              >
                Cari
              </Button>
            </Space>
            <TableUsulan data={dataUsulan} isLoading={isLoadingUsulan} />
          </Stack>
        </>
      )}
    </>
  );
}

export default RefJenisUsulan;
