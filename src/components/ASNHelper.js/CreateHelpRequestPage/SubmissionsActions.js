import {
  SendOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { Button, Flex, Space } from "antd";

const SubmissionsActions = ({
  currentStep = 0,
  totalSteps = 3,
  onNext,
  onPrev,
  onSubmit,
  onSaveDraft,
  onBack,
  loading = false,
  canProceed = true,
  showBack = true,
  showNext = true,
  showSubmit = false,
  showSaveDraft = true,
}) => {
  return (
    <Flex justify="space-between" align="center" style={{ marginTop: "16px" }}>
      <div>
        {showBack && (
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            style={{
              color: "#787C7E",
              borderColor: "#EDEFF1",
            }}
          >
            Kembali
          </Button>
        )}
      </div>

      <Space>
        {showSaveDraft && currentStep > 0 && (
          <Button
            icon={<SaveOutlined />}
            onClick={onSaveDraft}
            style={{
              color: "#787C7E",
              borderColor: "#EDEFF1",
            }}
          >
            Simpan Draft
          </Button>
        )}

        {showNext && (
          <Button
            type="primary"
            icon={<ArrowRightOutlined />}
            onClick={onNext}
            disabled={!canProceed}
            style={{
              backgroundColor: canProceed ? "#FF4500" : undefined,
              borderColor: canProceed ? "#FF4500" : undefined,
              fontWeight: 600,
              fontSize: "14px",
              borderRadius: "6px",
              minWidth: "120px",
            }}
          >
            Lanjutkan
          </Button>
        )}

        {showSubmit && (
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={onSubmit}
            loading={loading}
            disabled={!canProceed}
            style={{
              backgroundColor: "#FF4500",
              borderColor: "#FF4500",
              fontWeight: 600,
              fontSize: "14px",
              borderRadius: "6px",
              minWidth: "140px",
            }}
          >
            Kirim Permintaan Bantuan
          </Button>
        )}
      </Space>
    </Flex>
  );
};

export default SubmissionsActions;
