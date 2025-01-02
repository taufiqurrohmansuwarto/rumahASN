import {
  deleteUnorRekon,
  getUnorRekon,
  getUnorSiasn,
  getUnorSimaster,
  postUnorRekon,
} from "@/services/unor.services";
import { Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, message, TreeSelect } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";

const UnorSimaster = () => {
  const router = useRouter();
  const { data, isLoading } = useQuery(
    ["rekon-unor-simaster"],
    () => getUnorSimaster(),
    {}
  );

  const handleChange = (value) => {
    router.push(`/rekon/rekon-unor?master_id=${value}`);
  };

  return (
    <div>
      <TreeSelect
        treeNodeFilterProp="title"
        showSearch
        style={{ width: "100%" }}
        treeData={data}
        value={router?.query?.master_id}
        onSelect={handleChange}
      />
    </div>
  );
};

const UnorSiasn = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedUnor, setSelectedUnor] = useState(null);

  const { data, isLoading } = useQuery(
    ["rekon-unor-siasn"],
    () => getUnorSiasn(),
    {}
  );

  const { mutate: post, isLoading: isLoadingPost } = useMutation({
    mutationFn: (payload) => postUnorRekon(payload),
    onSuccess: () => {
      message.success("Berhasil menyimpan data");
      queryClient.invalidateQueries({
        queryKey: ["rekon-unor", router?.query?.master_id],
      });
    },
    onError: (error) => {
      message.error("Gagal menyimpan data");
      console.log(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["rekon-unor", router?.query?.master_id],
      });
    },
  });

  const handleSave = () => {
    const payload = {
      id_simaster: router?.query?.master_id,
      id_siasn: selectedUnor,
    };

    post(payload);
  };

  const handleSelect = (value) => {
    setSelectedUnor(value);
  };

  return (
    <div>
      <TreeSelect
        treeNodeFilterProp="title"
        showSearch
        style={{ width: "100%" }}
        treeData={data}
        value={selectedUnor}
        onSelect={handleSelect}
      />
      <Button
        loading={isLoadingPost}
        disabled={!selectedUnor}
        onClick={handleSave}
      >
        Simpan
      </Button>
    </div>
  );
};

const RekonUnorSIASN = () => {
  const router = useRouter();
  const { master_id } = router?.query;
  const queryClient = useQueryClient();

  const { data: rekonUnor, isLoading: isLoadingRekonUnor } = useQuery(
    ["rekon-unor", master_id],
    () => getUnorRekon(master_id),
    {
      enabled: !!master_id,
    }
  );

  const { mutate: hapus, isLoading: isLoadingHapus } = useMutation({
    mutationFn: (id) => deleteUnorRekon(id),
    onSuccess: () => {
      message.success("Berhasil menghapus data");
      queryClient.invalidateQueries({
        queryKey: ["rekon-unor", master_id],
      });
    },
    onError: (error) => {
      message.error("Gagal menghapus data");
      console.log(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["rekon-unor", master_id],
      });
    },
  });

  const handleHapus = (id) => {
    hapus(id);
  };

  return (
    <>
      <UnorSimaster />
      {master_id && (
        <Stack>
          <UnorSiasn />
          {JSON.stringify(master_id)}
          {rekonUnor?.length > 0 &&
            rekonUnor?.map((item) => (
              <div key={item?.id}>
                {item?.id_siasn} {item?.unor_siasn}
                <Button onClick={() => handleHapus(item?.id)}>Hapus</Button>
              </div>
            ))}
        </Stack>
      )}
    </>
  );
};

export default RekonUnorSIASN;
