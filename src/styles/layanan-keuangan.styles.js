// config/antd-config.js
import { Grid } from "antd";
import id from "antd/locale/id_ID";
import { createStyles } from "antd-style";
import { useFontJakarta } from "./fonts";

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
        background: linear-gradient(135deg, #dc2626, #ef4444);
        position: absolute;
        inset: -1px;
        opacity: 1;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: inherit;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      &:hover::before {
        opacity: 0.9;
        box-shadow: 0 4px 8px rgba(239, 68, 68, 0.4);
        transform: translateY(-1px);
      }

      &:active::before {
        transform: scale(0.98);
        box-shadow: 0 1px 2px rgba(185, 28, 28, 0.3);
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
      Button: {
        colorPrimary: "#DC2626",
        colorPrimaryHover: "#B91C1C",
        colorPrimaryActive: "#991B1B",
      },
      Layout: {
        colorBgHeader: "#ffffff",
        colorBgBody: "#f8f9fa",
      },
      Menu: {
        colorBgContainer: "#ffffff",
        colorPrimary: "#DC2626",
        colorItemText: "#5f6368",
        colorItemTextSelected: "#B91C1C",
      },
    },
    token: {
      colorPrimary: "#DC2626",
      colorSuccess: "#34a853",
      colorWarning: "#fbbc04",
      colorError: "#ea4335",
      colorInfo: "#DC2626",
      colorText: "#202124",
      colorTextSecondary: "#5f6368",
      colorBgContainer: "#ffffff",
      colorBgLayout: "#f8f9fa",
      borderRadius: 8,
      fontSize: 14,
      fontFamily: useFontJakarta(),
    },
  };
};

// Locale configuration
export const getLocaleConfig = () => {
  return id;
};

// Gmail token configuration
export const layananKeuanganToken = {
  header: {
    colorBgHeader: "#FFFFFF",
    colorHeaderTitle: "#202124",
  },
  bgLayout: "#F8F9FA",
  colorPrimary: "#DC2626",
  sider: {
    colorBgCollapsedButton: "#FFFFFF",
    colorTextCollapsedButton: "#5F6368",
    colorTextCollapsedButtonHover: "#DC2626",
    colorBgMenuItemActive: "#FEE2E2",
    colorTextMenuTitle: "#202124",
    colorTextMenuItemHover: "#DC2626",
    colorTextMenuSelected: "#B91C1C",
    colorTextMenuActive: "#B91C1C",
    colorBgMenuItemHover: "#F1F3F4",
    colorBgMenuItemSelected: "#FEE2E2",
    colorBgMenuItemCollapsedElevated: "#FFFFFF",
    colorTextMenu: "#202124",
    colorBgMenu: "#FFFFFF",
    colorTextMenuSecondary: "#5F6368",
    colorMenuItemDivider: "#DADCE0",
  },
};

// Main hook untuk semua config
export const useLayananKeuanganConfig = () => {
  const buttonConfig = useButtonConfig();
  const themeConfig = useThemeConfig();
  const localeConfig = getLocaleConfig();

  return {
    button: buttonConfig,
    theme: themeConfig,
    locale: localeConfig,
  };
};
