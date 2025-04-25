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
          name={name}
          rules={[
            { required: true, message: "Jenis mutasi tidak boleh kosong" },
          ]}
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
