import { Form, Select, InputNumber, Row, Col } from "antd";
import { useQuery } from "@tanstack/react-query";
import { getRefJftSiasnById } from "@/services/siasn-services";
import { useEffect } from "react";

const predikat = [
  { label: "Pemula", jenjang: "PM", predikat: "SANGAT BAIK", value: 5.63 },
  { label: "Pemula", jenjang: "PM", predikat: "BAIK", value: 3.75 },
  { label: "Pemula", jenjang: "PM", predikat: "BUTUH PERBAIKAN", value: 2.81 },
  { label: "Pemula", jenjang: "PM", predikat: "KURANG", value: 1.88 },
  { label: "Pemula", jenjang: "PM", predikat: "SANGAT KURANG", value: 0.94 },

  { label: "Terampil", jenjang: "TR", predikat: "SANGAT BAIK", value: 7.5 },
  { label: "Terampil", jenjang: "TR", predikat: "BAIK", value: 5 },
  {
    label: "Terampil",
    jenjang: "TR",
    predikat: "BUTUH PERBAIKAN",
    value: 3.75,
  },
  { label: "Terampil", jenjang: "TR", predikat: "KURANG", value: 2.5 },
  { label: "Terampil", jenjang: "TR", predikat: "SANGAT KURANG", value: 1.25 },

  { label: "Mahir", jenjang: "MH", predikat: "SANGAT BAIK", value: 18.75 },
  { label: "Mahir", jenjang: "MH", predikat: "BAIK", value: 12.5 },
  { label: "Mahir", jenjang: "MH", predikat: "BUTUH PERBAIKAN", value: 9.38 },
  { label: "Mahir", jenjang: "MH", predikat: "KURANG", value: 6.25 },
  { label: "Mahir", jenjang: "MH", predikat: "SANGAT KURANG", value: 3.13 },

  { label: "Penyelia", jenjang: "PY", predikat: "SANGAT BAIK", value: 37.5 },
  { label: "Penyelia", jenjang: "PY", predikat: "BAIK", value: 25 },
  {
    label: "Penyelia",
    jenjang: "PY",
    predikat: "BUTUH PERBAIKAN",
    value: 18.75,
  },
  { label: "Penyelia", jenjang: "PY", predikat: "KURANG", value: 12.5 },
  { label: "Penyelia", jenjang: "PY", predikat: "SANGAT KURANG", value: 6.25 },

  {
    label: "Ahli Pertama",
    jenjang: "PT",
    predikat: "SANGAT BAIK",
    value: 18.75,
  },
  { label: "Ahli Pertama", jenjang: "PT", predikat: "BAIK", value: 12.5 },
  {
    label: "Ahli Pertama",
    jenjang: "PT",
    predikat: "BUTUH PERBAIKAN",
    value: 9.38,
  },
  { label: "Ahli Pertama", jenjang: "PT", predikat: "KURANG", value: 6.25 },
  {
    label: "Ahli Pertama",
    jenjang: "PT",
    predikat: "SANGAT KURANG",
    value: 3.13,
  },

  { label: "Ahli Muda", jenjang: "MU", predikat: "SANGAT BAIK", value: 37.5 },
  { label: "Ahli Muda", jenjang: "MU", predikat: "BAIK", value: 25 },
  {
    label: "Ahli Muda",
    jenjang: "MU",
    predikat: "BUTUH PERBAIKAN",
    value: 18.75,
  },
  { label: "Ahli Muda", jenjang: "MU", predikat: "KURANG", value: 12.5 },
  { label: "Ahli Muda", jenjang: "MU", predikat: "SANGAT KURANG", value: 6.25 },

  { label: "Ahli Madya", jenjang: "MA", predikat: "SANGAT BAIK", value: 56.25 },
  { label: "Ahli Madya", jenjang: "MA", predikat: "BAIK", value: 37.5 },
  {
    label: "Ahli Madya",
    jenjang: "MA",
    predikat: "BUTUH PERBAIKAN",
    value: 28.13,
  },
  { label: "Ahli Madya", jenjang: "MA", predikat: "KURANG", value: 18.75 },
  {
    label: "Ahli Madya",
    jenjang: "MA",
    predikat: "SANGAT KURANG",
    value: 9.38,
  },

  { label: "Ahli Utama", jenjang: "UT", predikat: "SANGAT BAIK", value: 75 },
  { label: "Ahli Utama", jenjang: "UT", predikat: "BAIK", value: 50 },
  {
    label: "Ahli Utama",
    jenjang: "UT",
    predikat: "BUTUH PERBAIKAN",
    value: 37.5,
  },
  { label: "Ahli Utama", jenjang: "UT", predikat: "KURANG", value: 25 },
  {
    label: "Ahli Utama",
    jenjang: "UT",
    predikat: "SANGAT KURANG",
    value: 12.5,
  },
];

const FormAngkaKreditPredikat = ({ form, jabatanId }) => {
  const { data: refJft } = useQuery({
    queryKey: ["ref-jft-siasn", jabatanId],
    queryFn: () => getRefJftSiasnById(jabatanId),
    enabled: !!jabatanId,
  });

  // Filter predikat berdasarkan jenjang jabatan
  const filteredPredikat = predikat?.filter(
    (item) => item.jenjang === refJft?.jenjang
  );

  // Buat options untuk dropdown predikat
  const predikatOptions = filteredPredikat?.map((item) => ({
    value: item.predikat,
    label: `${item.predikat} (${item.value})`,
    angkaKredit: item.value,
  }));

  // Update angka kredit ketika predikat dipilih
  const handlePredikatChange = (selectedPredikat) => {
    const selectedItem = filteredPredikat?.find(
      (item) => item.predikat === selectedPredikat
    );

    if (selectedItem) {
      form.setFieldsValue({
        kreditBaruTotal: selectedItem.value,
      });
    }
  };

  // Reset field predikat ketika jabatan berubah
  useEffect(() => {
    form.setFieldsValue({
      predikat: undefined,
      kreditBaruTotal: undefined,
    });
  }, [jabatanId, form]);

  return (
    <Row gutter={8}>
      <Col span={12}>
        <Form.Item
          name="predikat"
          label="Predikat Kinerja"
          required
          rules={[{ required: true, message: "Pilih predikat" }]}
        >
          <Select
            placeholder="Pilih Predikat"
            options={predikatOptions}
            onChange={handlePredikatChange}
            allowClear
          />
        </Form.Item>
      </Col>

      <Col span={12}>
        <Form.Item
          name="kreditBaruTotal"
          label="Total Angka Kredit"
          required
          rules={[{ required: true, message: "Total angka kredit diperlukan" }]}
        >
          <InputNumber
            min={0}
            step={0.01}
            precision={2}
            placeholder="Otomatis terisi"
            style={{ width: "100%" }}
          />
        </Form.Item>
      </Col>
    </Row>
  );
};

export default FormAngkaKreditPredikat;
