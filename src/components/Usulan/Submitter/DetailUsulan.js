import { detailSubmissionSubmitters } from "@/services/submissions.services";
import { InboxOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Upload } from "antd";

const UploadDokumen = ({ fileName }) => {
  const customRequest = async () => {
    try {
    } catch (error) {}
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
      <p className="ant-upload-text">Uggah SK Jabatan</p>
    </Upload.Dragger>
  );
};

function DetailUsulan({ id }) {
  const { data, isLoading } = useQuery(
    ["detail-usulan", id],
    () => detailSubmissionSubmitters(id),
    {}
  );
  return (
    <div>
      {JSON.stringify(data)}
      <UploadDokumen />
    </div>
  );
}

export default DetailUsulan;
