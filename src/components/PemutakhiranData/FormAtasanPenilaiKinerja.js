import { Form, Select, Spin } from "antd";
import { useQuery } from "@tanstack/react-query";
import { dataKinerjaPns } from "@/services/siasn-services";

const FormAtasanPenilaiKinerja = ({ name, label = "Atasan Penilai", nip }) => {
  const { data, isLoading } = useQuery(
    ["pns-kinerja", nip],
    () => dataKinerjaPns(nip),
    {
      enabled: Boolean(nip),
    }
  );

  return (
    <Form.Item
      label={label}
      name={name}
      rules={[{ required: true, message: "Atasan penilai wajib dipilih" }]}
    >
      <Select
        placeholder="Pilih Atasan Penilai"
        loading={isLoading}
        notFoundContent={
          isLoading ? <Spin size="small" /> : "Data tidak ditemukan"
        }
      >
        {data && (
          <Select.Option value={data?.nip_baru}>
            {data?.nama} – {data?.unor_nm}
          </Select.Option>
        )}
      </Select>
    </Form.Item>
  );
};

export default FormAtasanPenilaiKinerja;
