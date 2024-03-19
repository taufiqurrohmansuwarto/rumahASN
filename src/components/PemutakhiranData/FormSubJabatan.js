import { refSubJabatan } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Form, Select } from "antd";
import { useEffect } from "react";

const FormSubJabatan = ({ name, help, kelJabatanId }) => {
  const { data, isLoading, refetch } = useQuery(
    ["data-sub-jabatan", kelJabatanId],
    () => refSubJabatan(kelJabatanId),
    {}
  );

  useEffect(() => {
    if (kelJabatanId) {
      refetch();
    }
  }, [kelJabatanId, refetch]);

  return (
    <>
      {data && data?.length ? (
        <Form.Item
          required
          label={"Pilih Sub Jabatan"}
          rules={[{ required: true }]}
          name={name}
          help="Ketik nama jabatan kemudian tunggu.."
        >
          <Select
            showSearch
            placeholder="Pilih Sub Jabatan"
            loading={isLoading}
            optionFilterProp="nama"
          >
            {data?.map((item) => (
              <Select.Option nama={item?.nama} key={item?.id} value={item?.id}>
                {item?.nama}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      ) : null}
    </>
  );
};

export default FormSubJabatan;
