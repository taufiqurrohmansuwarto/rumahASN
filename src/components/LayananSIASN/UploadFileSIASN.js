import { Button, Upload } from "antd";
import React from "react";
import { useState } from "react";

function UploadFileSIASN({ fileId }) {
  const [fileList, setFileList] = useState([]);

  const handleChange = (fileInfo) => {
    console.log(fileInfo);
  };

  return (
    <Upload
      beforeUpload={() => false}
      onChange={handleChange}
      maxCount={1}
      accept=".pdf"
      fileList={fileList}
    >
      <Button>Upload</Button>
    </Upload>
  );
}

export default UploadFileSIASN;
