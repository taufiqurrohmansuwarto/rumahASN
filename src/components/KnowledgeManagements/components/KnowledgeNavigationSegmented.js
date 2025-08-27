import { Segmented } from "antd";
import { useRouter } from "next/router";

const KnowledgeNavigationSegmented = ({
  currentPath = "/asn-connect/asn-knowledge",
  style = {},
}) => {
  const router = useRouter();

  const options = [
    {
      label: "Semua",
      value: "/asn-connect/asn-knowledge",
    },
    {
      label: "ASNPedia Saya",
      value: "/asn-connect/asn-knowledge/my-knowledge",
    },
    {
      label: "Dashboard Saya",
      value: "/asn-connect/asn-knowledge/my-knowledge/dashboard",
    },
  ];

  const handleChange = (value) => {
    if (value !== currentPath) {
      router.push(value);
    }
  };

  return (
    <Segmented
      options={options}
      value={currentPath}
      onChange={handleChange}
      style={{
        ...style,
      }}
    />
  );
};

export default KnowledgeNavigationSegmented;
