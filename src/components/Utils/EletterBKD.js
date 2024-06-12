import { Tooltip, FloatButton } from "antd";
import { WhatsAppOutlined } from "@ant-design/icons";

function EletterBKD({ right = 70 }) {
  // create link whatssapmessage
  const handleClick = () => {
    const message =
      "Halo, Saya ingin bertanya tentang E-Letter BKD Provinsi Jawa Timur";
    const url = `https://wa.me/628989166766?text=${encodeURI(message)}`;
    window.open(url, "_blank");
  };

  return (
    <Tooltip title="E-Letter BKD">
      <FloatButton
        onClick={handleClick}
        icon={<WhatsAppOutlined />}
        type="primary"
        style={{ right }}
      />
    </Tooltip>
  );
}

export default EletterBKD;
