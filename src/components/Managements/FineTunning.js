import React, { useState } from "react";
import { Button, message } from "antd";
import { downloadFineTunning } from "@/services/admin.services";
import { saveAs } from "file-saver";

function FineTunning() {
  const [loading, setLoading] = useState(false);
  const handleDownload = async () => {
    setLoading(true);
    const response = await downloadFineTunning();
    const blob = new Blob([response], { type: "application/jsonl" });
    saveAs(blob, "fine-tuning-data.jsonl");
    setLoading(false);
    message.success("Berhasil mengunduh data fine-tuning");
  };

  return (
    <Button type="primary" onClick={handleDownload} loading={loading}>
      Download Fine Tunning
    </Button>
  );
}

export default FineTunning;
