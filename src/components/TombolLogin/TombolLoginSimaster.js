import { Button, ConfigProvider, Typography } from "antd";
import { createStyles } from "antd-style";

const useStyle = createStyles(({ prefixCls, css }) => ({
  linearGradientButton: css`
    &.${prefixCls}-btn-primary:not([disabled]):not(
        .${prefixCls}-btn-dangerous
      ) {
      border-width: 0;
      border-radius: 8px; /* Membuat sudut tombol lebih lembut */
      position: relative;
      overflow: hidden;

      > span {
        position: relative;
        z-index: 1; /* Memastikan teks berada di atas gradient */
      }

      &::before {
        content: "";
        background: linear-gradient(
          135deg,
          #ff9800,
          #f44336
        ); /* Warna gradasi oranye ke merah */
        position: absolute;
        inset: 0;
        z-index: 0; /* Menyimpan gradasi di bawah teks */
        opacity: 1;
        transition: opacity 0.3s;
        border-radius: inherit;
      }

      &:hover::before {
        opacity: 0.8; /* Membuat efek hover yang lebih halus */
      }

      &:active::before {
        opacity: 0.6; /* Mengurangi opacity saat ditekan */
      }
    }
  `,
}));

function TombolLoginSimaster({ text, ...props }) {
  const { styles } = useStyle();
  return (
    <ConfigProvider
      button={{
        className: styles.linearGradientButton,
      }}
    >
      <Button type="primary" size="large" {...props}>
        <Typography.Text strong style={{ fontSize: 14, color: "white" }}>
          {text}
        </Typography.Text>
      </Button>
    </ConfigProvider>
  );
}

export default TombolLoginSimaster;
