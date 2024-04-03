import {
  createSubmissionSubmitter,
  detailSubmissionSubmitter,
} from "@/services/submissions.services";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Modal, Skeleton } from "antd";
import { useRouter } from "next/router";
import React from "react";

function DetailSubmission() {
  const router = useRouter();

  const { mutateAsync: create, isLoading: isLoadingCreate } = useMutation(
    (data) => createSubmissionSubmitter(data),
    {
      onSuccess: () => {},
    }
  );

  const { data, isLoading } = useQuery(
    ["detail-submission-submitter", router?.query?.id],
    () => detailSubmissionSubmitter(router?.query?.id),
    {}
  );

  const handleModalConfirm = () => {
    Modal.confirm({
      title: "Konfirmasi Pembuatan Usulan",
      content:
        "Saya telah membaca dan memahami informasi yang diberikan. Apakah Anda yakin ingin membuat usulan?",
      onOk: async () => {
        const payload = {
          submission_reference_id: router?.query?.id,
        };
        const result = await create(payload);
        console.log(result);
      },
    });
  };

  return (
    <Skeleton loading={isLoading}>
      {JSON.stringify(data)}
      <Button onClick={handleModalConfirm} type="primary">
        Buat Usulan
      </Button>
    </Skeleton>
  );
}

export default DetailSubmission;
