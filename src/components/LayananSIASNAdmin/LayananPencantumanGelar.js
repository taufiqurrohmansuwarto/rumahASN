import { useMutation } from "@tanstack/react-query";
import { Button, Card, DatePicker, Form, message } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { syncPencantumanGelar } from "@/services/rekon.services";

const format = "DD MMMM YYYY";

function LayananPencantumanGelar() {
  const { mutate: sync, isLoading: loadingSync } = useMutation(
    (data) => syncPencantumanGelar(data),
    {
      onSuccess: () => {
        message.success("Berhasil sinkronisasi");
      },
      onError: (error) => {
        message.error(error?.response?.data?.message || "Gagal sinkronisasi");
      },
    }
  );
  const [periode, setPeriode] = useState([dayjs(), dayjs()]);

  const handleChangePeriode = (dates) => {
    setPeriode(dates);
  };

  const handleSubmit = () => {
    const tanggalAwal = periode[0].format("YYYY-MM-DD");
    const tanggalAkhir = periode[1].format("YYYY-MM-DD");

    sync({ tanggalAwal, tanggalAkhir });
  };

  return (
    <Card title="Pencantuman Gelar">
      <Form.Item label="Periode">
        <DatePicker.RangePicker
          presets={[
            {
              label: "10 Maret 2025 - Hari Ini",
              value: [dayjs("2025-03-10"), dayjs()],
            },
            {
              label: "Hari ini",
              value: [dayjs(), dayjs()],
            },
          ]}
          format={{
            format,
            type: "mask",
          }}
          value={periode}
          onChange={handleChangePeriode}
        />
      </Form.Item>
      <Form.Item>
        <Button
          onClick={handleSubmit}
          type="primary"
          htmlType="submit"
          loading={loadingSync}
        >
          Sinkronisasi
        </Button>
      </Form.Item>
    </Card>
  );
}

export default LayananPencantumanGelar;
