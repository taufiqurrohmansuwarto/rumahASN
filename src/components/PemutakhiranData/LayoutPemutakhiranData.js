import { Tabs } from "antd";
import { useRouter } from "next/router";
import PageContainer from "../PageContainer";

const LayoutPemutakhiranData = ({ children, active = "1" }) => {
  const { TabPane } = Tabs;
  const router = useRouter();

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
    <PageContainer title={findTitle(active)}>
      <Tabs onChange={handleChange} type="card" defaultActiveKey={active}>
        {items.map((item) => (
          <TabPane tab={item.title} key={item.key}>
            {children}
          </TabPane>
        ))}
      </Tabs>
    </PageContainer>
  );
};

export default LayoutPemutakhiranData;
