import { Button } from "antd";
import { useRouter } from "next/router";
import PageContainer from "../PageContainer";

const LayoutPemutakhiranData = ({ children, active = "1" }) => {
  const router = useRouter();

  const buatPertanyaan = () => {
    router.push("/tickets/create");
  };

  const items = [
    {
      title: "Data Utama",
      key: "1",
      path: "/pemutakhiran-data/data-utama",
    },
    {
      title: "Jabatan",
      key: "2",
      path: "/pemutakhiran-data/jabatan",
    },
    {
      title: "Angka Kredit",
      key: "3",
      path: "/pemutakhiran-data/angka-kredit",
    },
    {
      title: "SKP 22",
      key: "4",
      path: "/pemutakhiran-data/skp-2022",
    },
  ];

  const handleChange = (key) => {
    router.push(items.find((item) => item.key === key).path);
  };

  const findTitle = (key) => {
    return items.find((item) => item.key === key).title;
  };

  return (
    <PageContainer
      tabActiveKey={active}
      tabList={items.map((item) => {
        return {
          key: item.key,
          tab: item.title,
          path: item.path,
        };
      })}
      tabBarExtraContent={
        <Button disabled key="3" type="primary" onClick={buatPertanyaan}>
          Tanya BKD
        </Button>
      }
      // extra={[
      //   <Button key="3">Operation</Button>,
      //   <Button key="2">Operation</Button>,
      //   <Button key="1" type="primary">
      //     Primary Action
      //   </Button>,
      // ]}
      tabProps={{
        size: "small",
        onChange: handleChange,
        type: "card",
      }}
      title={`${findTitle(active)}`}
      subTitle="Peremajaan Data"
    >
      {children}
    </PageContainer>
  );
};

export default LayoutPemutakhiranData;
