// config/antd-config.js
import { Grid } from "antd";
import id from "antd/locale/id_ID";
import { createStyles } from "antd-style";

// Button styles
export const useButtonStyle = createStyles(({ prefixCls, css }) => ({
  linearGradientButton: css`
    &.${prefixCls}-btn-primary:not([disabled]):not(
        .${prefixCls}-btn-dangerous
      ) {
      > span {
        position: relative;
      }

      &::before {
        content: "";
        background: linear-gradient(135deg, #d4380d, #fa8c16);
        position: absolute;
        inset: -1px;
        opacity: 1;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: inherit;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      &:hover::before {
        opacity: 0.9;
        box-shadow: 0 4px 8px rgba(212, 56, 13, 0.4);
        transform: translateY(-1px);
      }

      &:active::before {
        transform: scale(0.98);
        box-shadow: 0 1px 2px rgba(212, 56, 13, 0.3);
      }

      &::after {
        content: "";
        position: absolute;
        inset: 0;
        background: radial-gradient(
          circle at center,
          rgba(255, 255, 255, 0.3) 0%,
          transparent 100%
        );
        opacity: 0;
        transition: opacity 0.3s;
        border-radius: inherit;
      }

      &:active::after {
        opacity: 1;
        animation: ripple 0.6s ease-out;
      }

      @keyframes ripple {
        from {
          transform: scale(0);
          opacity: 1;
        }
        to {
          transform: scale(2);
          opacity: 0;
        }
      }
    }
  `,
}));

// Button configuration
export const useButtonConfig = () => {
  const { styles } = useButtonStyle();
  return {
    className: styles.linearGradientButton,
  };
};

// Theme configuration
export const useThemeConfig = () => {
  const breakPoint = Grid.useBreakpoint();
  return {
    components: {
      Card: {
        paddingLG: breakPoint.xs ? 14 : 24,
      },
    },
    token: {
      colorPrimary: "#FA8C16",
    },
  };
};

// Locale configuration
export const getLocaleConfig = () => {
  return id;
};

// Main hook untuk semua config
export const useAntdConfig = () => {
  const buttonConfig = useButtonConfig();
  const themeConfig = useThemeConfig();
  const localeConfig = getLocaleConfig();

  return {
    button: buttonConfig,
    theme: themeConfig,
    locale: localeConfig,
  };
};
