import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { petaJabatan, petaJabatanById } from "@/services/siasn-services";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tree } from "antd";
import Head from "next/head";
import { useEffect, useState } from "react";

const PetaJabatan = () => {
  const queryClient = useQueryClient();

  // Fetch the initial tree data (root nodes)
  const { data: initialData, isLoading: isLoadingInitialData } = useQuery(
    ["petaJabatan"],
    petaJabatan,
    {
      staleTime: Infinity, // Adjust based on your needs
    }
  );

  // Function to dynamically load child nodes
  const loadChildNodes = async (node) => {
    const key = node.key;
    try {
      // Check if we already have the children for this node in the cache
      const cachedData = queryClient.getQueryData(["petaJabatanById", key]);
      if (cachedData) {
        return cachedData; // Return cached data if available
      } else {
        // Fetch the children nodes since they're not in cache
        const data = await petaJabatanById(key);
        queryClient.setQueryData(["petaJabatanById", key], data);
        return data;
      }
    } catch (error) {
      console.error("Error loading child nodes:", error);
    }
  };

  // Function to handle the onLoadData event from the Tree component
  const onLoadData = ({ key, children }) => {
    return new Promise((resolve) => {
      if (children) {
        resolve();
        return;
      }
      loadChildNodes({ key }).then((data) => {
        // Update the tree data with the loaded children
        setTreeData((prevData) => updateTreeData(prevData, key, data));
        resolve();
      });
    });
  };

  // Update a node's children in the tree data
  const updateTreeData = (list, key, children) => {
    return list.map((node) => {
      if (node.key === key) {
        return { ...node, children };
      }
      if (node.children) {
        return {
          ...node,
          children: updateTreeData(node.children, key, children),
        };
      }
      return node;
    });
  };

  // State to manage local tree data for rendering
  const [treeData, setTreeData] = useState([]);

  // Update local state when initial data is fetched
  useEffect(() => {
    if (initialData) {
      const processedData = initialData.map((item) => ({
        ...item,
        isLeaf: item.children_count === 0, // Set isLeaf based on children_count
      }));
      setTreeData(processedData);
    }
  }, [initialData]);

  return (
    <>
      <Head>
        <title>Fasilitator - Layanan SIASN - Peta Jabatan</title>
      </Head>
      <PageContainer
        title="Peta Jabatan"
        content="Peta Jabatan Layanan Perencanaan SIASN"
      >
        <Tree
          loadData={onLoadData}
          loadedKeys={[treeData?.[0]?.key]}
          treeData={treeData}
          height={500}
          showIcon
          showLine
          loading={isLoadingInitialData}
        />
      </PageContainer>
    </>
  );
};

PetaJabatan.Auth = {
  action: "manage",
  subject: "Feeds",
};

PetaJabatan.getLayout = function getLayout(page) {
  return <Layout active="/fasilitator-employees/peta-jabatan">{page}</Layout>;
};

export default PetaJabatan;
