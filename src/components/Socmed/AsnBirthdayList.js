import { employeeBirthdayTodayServices } from "@/services/master.services";
import { Group, Text, ThemeIcon } from "@mantine/core";
import { IconCake } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Button, Card, List, Tooltip, Modal } from "antd";
import { take } from "lodash";
import { useState } from "react";

const ModalShowAll = ({ data, close, open }) => {
  return (
    <Modal
      footer={null}
      title="Daftar Ulang Tahun ASN"
      open={open}
      onCancel={close}
    >
      <List
        itemLayout="horizontal"
        rowKey={(row) => row?.pegawai_id}
        dataSource={data}
        renderItem={(item) => (
          <List.Item actions={[<Button type="link">Kirim Pesan</Button>]}>
            <List.Item.Meta
              avatar={
                <Tooltip color="green" title={item?.skpd}>
                  <Avatar
                    style={{
                      cursor: "pointer",
                    }}
                    shape="circle"
                    src={item?.fileDiri?.foto}
                  />
                </Tooltip>
              }
              title={<Text size="xs">{item?.nama}</Text>}
              description={<Text>{item?.jabatan}</Text>}
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

  const handleShowAll = () => setShowAll(!showAll);
  const closeShowAll = () => setShowAll(false);

  const { data, isLoading } = useQuery(
    ["employee-today-birthday"],
    () => employeeBirthdayTodayServices(),
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <>
      <Card
        title={
          <Group>
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
          rowKey={(row) => row?.pegawai_id}
          dataSource={take(data, 5)}
          footer={
            <Button type="link" onClick={handleShowAll}>
              Lihat Semua ({data?.length})
            </Button>
          }
          renderItem={(item) => (
            <List.Item actions={[<Button type="link">Kirim Pesan</Button>]}>
              <List.Item.Meta
                avatar={
                  <Tooltip color="green" title={item?.skpd}>
                    <Avatar
                      style={{
                        cursor: "pointer",
                      }}
                      shape="circle"
                      src={item?.fileDiri?.foto}
                    />
                  </Tooltip>
                }
                title={<Text size="xs">{item?.nama}</Text>}
                description={<Text>{item?.jabatan}</Text>}
              />
            </List.Item>
          )}
        />
      </Card>
      <ModalShowAll data={data} close={closeShowAll} open={showAll} />
    </>
  );
};

export default ASNBirthdayList;
