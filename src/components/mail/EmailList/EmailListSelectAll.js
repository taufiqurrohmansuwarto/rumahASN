// components/mail/EmailList/EmailListSelectAll.js
import { Checkbox, Typography } from "antd";

const { Text } = Typography;

const EmailListSelectAll = ({
  selectedEmails = [],
  totalEmails = 0,
  onSelectAll,
}) => {
  const isIndeterminate =
    selectedEmails.length > 0 && selectedEmails.length < totalEmails;
  const isAllSelected =
    selectedEmails.length === totalEmails && totalEmails > 0;

  const handleSelectAll = (checked) => {
    onSelectAll?.(checked);
  };

  return (
    <div
      style={{
        padding: "12px 16px",
        borderBottom: "1px solid #f0f0f0",
        backgroundColor: "#fafafa",
      }}
    >
      <Checkbox
        indeterminate={isIndeterminate}
        checked={isAllSelected}
        onChange={(e) => handleSelectAll(e.target.checked)}
      >
        <Text>
          {selectedEmails.length > 0
            ? `${selectedEmails.length} dari ${totalEmails} email dipilih`
            : `Pilih semua ${totalEmails} email`}
        </Text>
      </Checkbox>
    </div>
  );
};

export default EmailListSelectAll;
