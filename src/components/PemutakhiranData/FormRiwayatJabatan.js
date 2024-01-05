import { getRwJabatan } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Form, Select } from "antd";

const filterJustFungsional = (data) => {
  return data?.filter((item) => item?.jenisJabatan === "2");
};

const FormRiwayatJabatan = ({ name, form }) => {
  const { data, isLoading } = useQuery(
    ["data-rw-jabatan"],
    () => getRwJabatan(),
    {
      select: filterJustFungsional,
    }
  );

  return (
    <>
      {data && (
        <>
          <Form.Item
            label={"Riwayat Jabatan"}
            rules={[{ required: true, message: "Riwayat Jabatan Wajib Diisi" }]}
            name={name}
          >
            <Select
              showSearch
              filterOption={false}
              placeholder="Riwayat Jabatan"
            >
              {data?.map((item) => (
                <Select.Option key={item?.id} value={item?.id}>
                  {item?.jabatanFungsionalNama} - {item?.unorNama} -{" "}
                  {item?.satuanKerjaNama}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </>
      )}
    </>
  );
};

export default FormRiwayatJabatan;
