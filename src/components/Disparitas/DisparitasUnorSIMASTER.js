import { unorASN } from "@/services/master.services";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Button, TreeSelect } from "antd";
import { useState } from "react";

function DisparitasUnorSIMASTER() {
  const [treeId, setTreeId] = useState(null);
  const handleChange = (value) => {
    setTreeId(value);
  };

  const { data, isLoading } = useQuery(["unor-simaster"], () => unorASN(), {
    refetchOnWindowFocus: false,
  });

  return (
    <Stack>
      <TreeSelect
        treeNodeFilterProp="title"
        showSearch
        style={{ width: "100%" }}
        treeData={data}
      />
      <Button>Cari</Button>
    </Stack>
  );
}

export default DisparitasUnorSIMASTER;
