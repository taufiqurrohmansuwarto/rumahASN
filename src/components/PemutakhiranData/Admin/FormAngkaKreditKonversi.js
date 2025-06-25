import { Form, Select } from "antd";
import { dataAngkaKreditKonversi } from "@/utils/index";

const { Option } = Select;

function FormAngkaKreditKonversi({ form }) {
  return (
    <Form.Item name="kreditBaruTotal" label="Kredit Baru Total (Konversi)">
      <Select
        showSearch
        placeholder="Pilih jabatan dan predikat"
        style={{ width: "100%" }}
        optionFilterProp="children"
        filterOption={(input, option) =>
          (option?.children ?? "")
            .toString()
            .toLowerCase()
            .includes(input.toLowerCase())
        }
      >
        {dataAngkaKreditKonversi.map((item) => (
          <Option key={item.label} value={item.value}>
            {item.label}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
}

export default FormAngkaKreditKonversi;
