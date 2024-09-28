import { useQuery } from "@tanstack/react-query";
import { getEmployeesBKD } from "@/services/guests-books.services";
import { Form, Select, Avatar, Typography, Space, Button } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

const FormEmployeeVisited = ({ name }) => {
  const { data, isLoading } = useQuery(
    ["pegawai_bkd"],
    () => getEmployeesBKD(),
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <div>
      <Form.List name={name}>
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <Space
                key={field.key}
                style={{ display: "flex", marginBottom: 8 }}
                align="baseline"
              >
                <Form.Item
                  {...field}
                  validateTrigger={["onChange", "onBlur"]}
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message:
                        "Pilih Pegawai yang dikunjungi atau hapus field ini.",
                    },
                  ]}
                  noStyle
                >
                  <Select
                    style={{ width: "300px" }}
                    showSearch
                    placeholder="Pilih Pegawai"
                    optionFilterProp="name"
                  >
                    {data?.map((item) => (
                      <Select.Option
                        name={item.name}
                        key={item.id}
                        value={item.id}
                      >
                        <Space>
                          <Avatar size="small" src={item.avatar} />
                          <Typography.Text>{item.name}</Typography.Text>
                        </Space>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Button
                  type="link"
                  onClick={() => remove(field.name)}
                  icon={<MinusCircleOutlined />}
                >
                  Hapus
                </Button>
              </Space>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                Tambah Pegawai
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </div>
  );
};

export default FormEmployeeVisited;
