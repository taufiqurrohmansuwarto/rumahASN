import { refJenisMutasi, refJenisPenugasan } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Form, Radio, Select } from "antd";

function FormJenisMutasi({ name }) {
  const { data, isLoading } = useQuery(
    ["ref-jenis-mutasi"],
    () => refJenisMutasi(),
    {}
  );

  return (
    <>
      {data && (
        <Form.Item
          required
          help="Gunakan Mutasi Unor jika unor yang berubah bukan jabatan"
          name={name}
          label="Jenis Mutasi"
        >
          <Radio.Group>
            {data?.map((item) => (
              <Radio.Button key={item?.id} value={item?.id}>
                {item?.nama}
              </Radio.Button>
            ))}
          </Radio.Group>
        </Form.Item>
      )}
    </>
  );
}

export default FormJenisMutasi;
