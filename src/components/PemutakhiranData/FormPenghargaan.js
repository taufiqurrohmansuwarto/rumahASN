import { dataRiwayatPenghargaan } from "@/utils/client-data";
import { Form, Input, Select } from "antd";

const FormPenghargaan = ({ name, label, disabled }) => {
  return (
    <Form.Item
      rules={[
        {
          required: true,
          message: "Pilih Jenis Penghargaan",
        },
      ]}
      name={name}
      label={label}
    >
      <Select showSearch allowClear optionFilterProp="nama" disabled={disabled}>
        {dataRiwayatPenghargaan.map((item) => (
          <Select.Option nama={item?.nama} key={item?.id} value={item?.id}>
            {item?.nama}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default FormPenghargaan;
