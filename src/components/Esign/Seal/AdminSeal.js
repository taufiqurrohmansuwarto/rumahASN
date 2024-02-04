import {
  generateSealActivation,
  setSubscriberId,
  setTotpActivationCode,
} from "@/services/esign-seal.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Table, message } from "antd";
import subscriber from "pages/api/esign/seal/subscriber";
import React from "react";

const FormSetSubscriberId = ({ open, onCancel, isLoading, set }) => {};

const FormSetTotp = ({ open, onCancel, isLoading, set }) => {};

function AdminSeal() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(["subscriber"], () => subscriber(), {});

  const { mutateAsync: generate, isLoading: isLoadingGenerate } = useMutation(
    (data) => generateSealActivation(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("subscriber");
        message.success("Seal activation code has been generated");
      },
    }
  );

  const { mutateAsync: setIdSubscriber, isLoading: isLoadingSetIdSubscriber } =
    useMutation((data) => setSubscriberId(data), {
      onSuccess: () => {
        queryClient.invalidateQueries("subscriber");
        message.success("Subscriber ID has been set");
      },
    });

  const { mutateAsync: setTotp, isLoading: isLoadingSetTotp } = useMutation(
    (data) => setTotpActivationCode(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("subscriber");
        message.success("Totp activation code has been set");
      },
    }
  );

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "ID Subscriber",
      dataIndex: "id_subscriber",
      key: "id_subscriber",
    },
    {
      title: "Totp Activation Code",
      dataIndex: "totp_activation_code",
      key: "totp_activation_code",
    },
  ];

  return (
    <>
      <Button>Generate Seal Activation</Button>
      <Table loading={isLoading} columns={columns} rowKey={(row) => row?.id} />
    </>
  );
}

export default AdminSeal;
