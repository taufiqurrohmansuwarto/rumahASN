import { SendOutlined } from "@ant-design/icons";
import { Button } from "antd";

const KnowledgeFormActions = ({
  isMobile,
  isLoading,
  mode,
  buttonText,
  onCancel,
  onSaveDraft,
  onSubmitForReview,
  showDraftButton,
  showSubmitButton
}) => {
  return (
    <div
      style={{
        borderTop: "1px solid #EDEFF1",
        paddingTop: isMobile ? "16px" : "20px",
        marginTop: isMobile ? "16px" : "20px",
        display: "flex",
        justifyContent: isMobile ? "center" : "flex-start",
        alignItems: "center",
        gap: isMobile ? "12px" : "16px",
        flexWrap: "wrap",
      }}
    >
      <Button
        onClick={onCancel}
        size="middle"
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#FF4500";
          e.currentTarget.style.color = "#FF4500";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#d9d9d9";
          e.currentTarget.style.color = "#595959";
        }}
      >
        {buttonText.cancel}
      </Button>
      
      {showDraftButton && (
        <Button
          onClick={onSaveDraft}
          loading={isLoading}
          size="middle"
          style={{
            borderColor: "#52c41a",
            color: "#52c41a",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#52c41a";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#52c41a";
          }}
        >
          {isLoading ? "Menyimpan..." : buttonText.draft}
        </Button>
      )}
      
      {showSubmitButton && (
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={onSubmitForReview}
          loading={isLoading}
          size="middle"
        >
          {isLoading ? (mode === "admin" ? "Memperbarui..." : "Mengirim...") : buttonText.submit}
        </Button>
      )}
    </div>
  );
};

export default KnowledgeFormActions;