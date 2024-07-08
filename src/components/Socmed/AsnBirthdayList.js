import { employeeBirthdayTodayServices } from "@/services/master.services";
import { Group, Text, ThemeIcon } from "@mantine/core";
import { IconCake } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Button, Card, List, Tooltip, Modal, Form, Input } from "antd";
import { take } from "lodash";
import { useEffect, useState } from "react";

const ModalMessage = ({ data, close, open }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        pesan: `Hai ${data?.nama}, Ulang tahun `,
      });
    }
  }, [open]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    console.log(values);
  };

  return (
    <Modal title="Kirim Pesan" open={open} onCancel={close}>
      <Form form={form} onFinish={handleSubmit}>
        <Form.Item name="pesan">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const ModalShowAll = ({ data, close, open }) => {
  return (
    <Modal
      footer={null}
      title="Daftar Ulang Tahun ASN"
      key="modal-ulang-tahun"
      open={open}
      onCancel={close}
    >
      <List
        itemLayout="horizontal"
        key="list-ulang-tahun-modal"
        rowKey={(row) => row?.id}
        dataSource={data}
        renderItem={(item) => (
          <List.Item
            key={item?.id}
            actions={[
              <Button key="button-kirim-pesan" type="link">
                Kirim Pesan
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={
                <Tooltip color="green" title={item?.skpd}>
                  <Avatar
                    key="avatar-ulang-tahun-modal"
                    style={{
                      cursor: "pointer",
                    }}
                    shape="circle"
                    src={item?.fileDiri?.foto}
                  />
                </Tooltip>
              }
              title={
                <Text key="text-nama" size="xs">
                  {item?.nama}
                </Text>
              }
              description={<Text key="text-jabatan">{item?.jabatan}</Text>}
            />
          </List.Item>
        )}
        pagination={false}
        style={{ height: "600px", overflow: "auto" }}
      />
    </Modal>
  );
};

const ASNBirthdayList = () => {
  const [showKirimPesan, setShowKirimPesan] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [data, setData] = useState(null);

  const handleShowAll = () => setShowAll(!showAll);
  const closeShowAll = () => setShowAll(false);

  const handleShowMessage = (data) => {
    setData(data);
    setShowKirimPesan(true);
  };

  const closeShowMessage = () => {
    setData(null);
    setShowKirimPesan(false);
  };

  const { data: dataUlangTahun, isLoading } = useQuery(
    ["employee-today-birthday"],
    () => employeeBirthdayTodayServices(),
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <>
      <Card
        key="card-ulang-tahun"
        title={
          <Group key="group-ulang-tahun">
            <ThemeIcon size="md" color="lime.4">
              <IconCake size={20} />
            </ThemeIcon>
            <Text>Ulang Tahun ASN</Text>
          </Group>
        }
      >
        <List
          itemLayout="horizontal"
          size="small"
          loading={isLoading}
          key="list-ulang-tahun"
          rowKey={(row) => row?.id}
          dataSource={take(dataUlangTahun, 5)}
          footer={
            <Button
              key="button-lihat-semua"
              type="link"
              onClick={handleShowAll}
            >
              Lihat Semua ({data?.length})
            </Button>
          }
          renderItem={(item) => (
            <List.Item
              key={item?.id}
              actions={[
                <Button
                  key="button-kirim-pesan-ulang-tahun"
                  type="link"
                  onClick={() => handleShowMessage(item)}
                >
                  Kirim Pesan
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Tooltip
                    key="tooltip-ulang-tahun"
                    color="green"
                    title={item?.skpd}
                  >
                    <Avatar
                      style={{
                        cursor: "pointer",
                      }}
                      key="avatar-ulang-tahun"
                      shape="circle"
                      src={item?.fileDiri?.foto}
                    />
                  </Tooltip>
                }
                title={
                  <Text key="text-nama-ulang-tahun" size="xs">
                    {item?.nama}
                  </Text>
                }
                description={
                  <Text key="text-jabatan-ulang-tahun">{item?.jabatan}</Text>
                }
              />
            </List.Item>
          )}
        />
      </Card>
      <ModalShowAll
        key="modal-ulang-tahun-all"
        data={dataUlangTahun}
        close={closeShowAll}
        open={showAll}
      />
      <ModalMessage
        key="modal-kirim-pesan"
        data={data}
        close={closeShowMessage}
        open={showKirimPesan}
      />
    </>
  );
};

export default ASNBirthdayList;
