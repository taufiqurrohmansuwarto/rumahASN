import { daftarStruktural } from "@/utils/client-utils";
import { Form, Select } from "antd";

const FormStruktural = ({ name }) => {
  return (
    <>
      <Form.Item label="Pilih Eselon" rules={[{ required: true }]} name={name}>
        <Select
          optionFilterProp="nama"
          allowClear
          showSearch
          placeholder="Pilih Eselon"
        >
          {daftarStruktural?.map((item) => (
            <Select.Option
              nama={`${item?.nama} - ${item?.jabatan_asn}`}
              key={item?.id}
              value={item?.id}
            >
              {item?.nama} - {item?.jabatan_asn}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </>
  );
};

export default FormStruktural;
