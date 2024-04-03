import {
  detailSubmissionSubmitters,
  uploadSubmitter,
} from "@/services/submissions.services";
import { InboxOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton, Upload } from "antd";
import { useRouter } from "next/router";

const UploadDokumen = ({ kode, namaFile, upload, id }) => {
  const customRequest = async ({ file, onSuccess, onError }) => {
    try {
      console.log(file);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kode_file", kode);
      formData.append("submission_id", id);

      const payload = {
        id,
        data: formData,
      };
      const result = await upload(payload);
      onSuccess(result, file);
    } catch (error) {
      console.log(error);
      onError(error);
    }
  };

  return (
    <Upload.Dragger
      customRequest={customRequest}
      maxCount={1}
      accept=".pdf"
      multiple={false}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">Uggah {namaFile}</p>
    </Upload.Dragger>
  );
};

function DetailUsulan({ id }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isLoading } = useQuery(
    ["detail-usulan", id],
    () => detailSubmissionSubmitters(id),
    {}
  );

  const { mutateAsync: upload, isLoading: isLoadingUpload } = useMutation(
    (data) => uploadSubmitter(data)
  );

  return (
    <Skeleton loading={isLoading}>
      {JSON.stringify(data)}
      {data?.reference?.submission_files?.map((item) => (
        <UploadDokumen
          id={router?.query?.id}
          upload={upload}
          isLoading={isLoadingUpload}
          key={item?.id}
          kode={item?.kode_file}
          namaFile={item?.file?.description}
        />
      ))}
    </Skeleton>
  );
}

export default DetailUsulan;
