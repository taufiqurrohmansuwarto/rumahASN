import { refJenisDiklat } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Form, Select } from "antd";

function FormJenisDiklat({ name }) {
  const { data: jenisDiklat, isLoading: loadingJenisDiklat } = useQuery(
    ["ref-jenis-diklat"],
    () => refJenisDiklat(),
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <>
      {jenisDiklat && (
        <Form.Item
          label="Jenis Diklat"
          name={name}
          required
          rules={[
            { required: true, message: "Jenis Diklat Tidak boleh kosong" },
          ]}
        >
          <Select labelInValue showSearch optionFilterProp="label" allowClear>
            {jenisDiklat?.map((item) => (
              <Select.Option
                title={item?.label}
                label={item?.label}
                key={item.id}
                value={item.id}
              >
                {item.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      )}
    </>
  );
}

export default FormJenisDiklat;
