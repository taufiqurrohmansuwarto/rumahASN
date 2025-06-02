// config/antd-config.js
import { Grid } from "antd";
import id from "antd/locale/id_ID";
import { createStyles } from "antd-style";

// Button styles - Indigo Elegant Theme
export const useButtonStyle = createStyles(({ prefixCls, css }) => ({
  linearGradientButton: css`
    &.${prefixCls}-btn-primary:not([disabled]):not(
        .${prefixCls}-btn-dangerous
      ) {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      border: none;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2),
        0 1px 3px rgba(99, 102, 241, 0.3);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 10px;
      font-weight: 600;
      letter-spacing: 0.025em;
      position: relative;
      overflow: hidden;

      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.2),
          transparent
        );
        transition: left 0.5s;
      }

      &:hover {
        background: linear-gradient(135deg, #4f46e5, #4338ca);
        box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3),
          0 2px 8px rgba(99, 102, 241, 0.4);
        transform: translateY(-2px);

        &::before {
          left: 100%;
        }
      }

      &:active {
        background: linear-gradient(135deg, #4338ca, #3730a3);
        box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);
        transform: translateY(-1px);
      }

      &:focus {
        box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15),
          0 2px 8px rgba(99, 102, 241, 0.2);
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

// Theme configuration - Indigo Elegant & Stylish
export const useThemeConfig = () => {
  const breakPoint = Grid.useBreakpoint();
  return {
    components: {
      Card: {
        paddingLG: breakPoint.xs ? 18 : 28,
        borderRadius: 16,
        boxShadow:
          "0 4px 6px rgba(99, 102, 241, 0.07), 0 1px 3px rgba(99, 102, 241, 0.1)",
      },
      Button: {
        colorPrimary: "#6366f1",
        colorPrimaryHover: "#4f46e5",
        colorPrimaryActive: "#4338ca",
        borderRadius: 10,
        fontWeight: 600,
        fontSize: 15,
      },
      Layout: {
        colorBgHeader: "#ffffff",
        colorBgBody: "#fafafb",
      },
      Menu: {
        colorBgContainer: "#ffffff",
        colorPrimary: "#6366f1",
        colorItemText: "#374151",
        colorItemTextSelected: "#4f46e5",
        colorItemTextHover: "#6366f1",
        colorBgMenuItemHover: "#eef2ff",
        colorBgMenuItemSelected: "#e0e7ff",
        fontWeight: 500,
      },
      Input: {
        borderRadius: 10,
        colorBorder: "#d1d5db",
        colorBorderHover: "#6366f1",
        colorPrimaryHover: "#6366f1",
        fontSize: 15,
      },
      Select: {
        borderRadius: 10,
        colorBorder: "#d1d5db",
        colorPrimaryHover: "#6366f1",
        fontSize: 15,
      },
      Table: {
        borderRadius: 14,
        colorBorderSecondary: "#f1f5f9",
        fontSize: 15,
      },
      Typography: {
        titleMarginTop: 0,
        titleMarginBottom: 16,
        fontWeightStrong: 600,
      },
      Tag: {
        borderRadius: 20,
        fontSize: 13,
        fontWeight: 500,
        paddingInline: 12,
        colorPrimary: "#6366f1",
        colorPrimaryBg: "#eef2ff",
        colorPrimaryBorder: "#c7d2fe",
        colorSuccess: "#10b981",
        colorSuccessBg: "#d1fae5",
        colorSuccessBorder: "#a7f3d0",
        colorWarning: "#f59e0b",
        colorWarningBg: "#fef3c7",
        colorWarningBorder: "#fde68a",
        colorError: "#ef4444",
        colorErrorBg: "#fecaca",
        colorErrorBorder: "#fca5a5",
      },
      Badge: {
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 600,
        boxShadow: "0 2px 4px rgba(99, 102, 241, 0.2)",
      },
      Modal: {
        borderRadius: 16,
        boxShadow: "0 25px 50px rgba(99, 102, 241, 0.15)",
        paddingContentHorizontal: 32,
        paddingMD: 28,
        titleFontSize: 20,
        titleLineHeight: 1.4,
        fontWeightStrong: 600,
      },
      Drawer: {
        borderRadius: 16,
        boxShadow: "0 25px 50px rgba(99, 102, 241, 0.15)",
        paddingLG: 28,
        titleFontSize: 18,
        fontWeightStrong: 600,
      },
      Tooltip: {
        borderRadius: 8,
        fontSize: 13,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        colorBgSpotlight: "#1f2937",
      },
      Notification: {
        borderRadius: 12,
        boxShadow: "0 10px 25px rgba(99, 102, 241, 0.1)",
        paddingMD: 20,
        fontSize: 14,
        fontSizeLG: 16,
      },
      Alert: {
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 500,
        paddingContentHorizontal: 20,
        paddingMD: 16,
      },
      Switch: {
        borderRadius: 100,
        trackHeight: 24,
        trackMinWidth: 48,
        trackPadding: 2,
        handleSize: 20,
        handleShadow: "0 2px 6px rgba(99, 102, 241, 0.3)",
      },
      Progress: {
        borderRadius: 10,
        lineCap: "round",
        strokeLinecap: "round",
      },
      Slider: {
        borderRadius: 10,
        handleSize: 18,
        handleSizeHover: 20,
        trackBg: "#e5e7eb",
        trackHoverBg: "#d1d5db",
        handleColor: "#6366f1",
        dotBorderWidth: 3,
        dotSize: 8,
        railBg: "#f3f4f6",
        railHoverBg: "#e5e7eb",
      },
      Tabs: {
        borderRadius: 8,
        fontSize: 15,
        fontWeight: 500,
        inkBarColor: "#6366f1",
        itemSelectedColor: "#6366f1",
        itemHoverColor: "#818cf8",
        itemActiveColor: "#4f46e5",
        cardPadding: "12px 20px",
        cardGutter: 4,
      },
      Pagination: {
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 600,
        itemSize: 40,
        itemSizeSM: 32,
        itemActiveBg: "#6366f1",
        itemActiveColorDisabled: "#ffffff",
        itemLinkBg: "#ffffff",
        itemInputBg: "#ffffff",
        colorPrimary: "#6366f1",
        colorPrimaryHover: "#4f46e5",
        colorText: "#374151",
        colorTextDisabled: "#9ca3af",
        colorBgTextHover: "#eef2ff",
        colorBgTextActive: "#6366f1",
        borderColor: "#e5e7eb",
        borderColorHover: "#6366f1",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        itemPadding: "0 8px",
      },
      Steps: {
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 500,
        colorPrimary: "#6366f1",
        colorText: "#374151",
        colorTextDescription: "#6b7280",
        dotSize: 32,
        dotCurrentSize: 40,
        iconSize: 16,
        iconSizeSM: 14,
      },
      DatePicker: {
        borderRadius: 10,
        fontSize: 15,
        cellRangeBorderColor: "#c7d2fe",
        cellBgDisabled: "#f9fafb",
        cellHoverBg: "#eef2ff",
        cellActiveWithRangeBg: "#e0e7ff",
        cellRangeBorderColor: "#c7d2fe",
        cellHoverWithRangeBg: "#eef2ff",
        timeColumnWidth: 70,
        timeColumnHeight: 28,
        timeCellHeight: 28,
      },
      Spin: {
        borderRadius: "50%",
        colorPrimary: "#6366f1",
        dotSize: 24,
        dotSizeSM: 16,
        dotSizeLG: 32,
      },
    },
    token: {
      colorPrimary: "#6366f1",
      colorSuccess: "#10b981",
      colorWarning: "#f59e0b",
      colorError: "#ef4444",
      colorInfo: "#06b6d4",
      colorText: "#1f2937",
      colorTextSecondary: "#6b7280",
      colorTextTertiary: "#9ca3af",
      colorBgContainer: "#ffffff",
      colorBgLayout: "#fafafb",
      colorBgElevated: "#ffffff",
      colorBorder: "#e5e7eb",
      colorBorderSecondary: "#f1f5f9",
      borderRadius: 10,
      borderRadiusLG: 16,
      fontSize: 15,
      fontSizeLG: 16,
      fontWeightStrong: 600,
      fontFamily:
        "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      boxShadow:
        "0 4px 6px rgba(99, 102, 241, 0.07), 0 1px 3px rgba(99, 102, 241, 0.1)",
      boxShadowSecondary:
        "0 10px 15px rgba(99, 102, 241, 0.1), 0 4px 6px rgba(99, 102, 241, 0.05)",
    },
  };
};

// Locale configuration
export const getLocaleConfig = () => {
  return id;
};

// Indigo token configuration - Ultra Stylish & Premium
export const rekonToken = {
  header: {
    colorBgHeader: "#FFFFFF",
    colorHeaderTitle: "#1f2937",
    headerHeight: 72,
    paddingInline: 32,
    borderBottom: "1px solid #f1f5f9",
    boxShadow:
      "0 1px 3px rgba(99, 102, 241, 0.06), 0 1px 2px rgba(0, 0, 0, 0.06)",
    fontWeight: 600,
    fontSize: 18,
  },
  bgLayout: "#FAFAFB",
  colorPrimary: "#6366F1",
  borderRadius: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
  },
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    fontFamily:
      "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeightLight: 300,
    fontWeightNormal: 400,
    fontWeightMedium: 500,
    fontWeightSemiBold: 600,
    fontWeightBold: 700,
    fontSize: {
      xs: 12,
      sm: 13,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 20,
      display: 24,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  shadows: {
    sm: "0 1px 3px rgba(99, 102, 241, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px rgba(99, 102, 241, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px rgba(99, 102, 241, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px rgba(99, 102, 241, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)",
    premium:
      "0 25px 50px rgba(99, 102, 241, 0.15), 0 10px 20px rgba(0, 0, 0, 0.05)",
  },
  animations: {
    duration: {
      fast: "0.15s",
      normal: "0.25s",
      slow: "0.35s",
    },
    easing: {
      ease: "cubic-bezier(0.4, 0, 0.2, 1)",
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
      easeOut: "cubic-bezier(0, 0, 0.2, 1)",
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
  },
  sider: {
    colorBgCollapsedButton: "#FFFFFF",
    colorTextCollapsedButton: "#6B7280",
    colorTextCollapsedButtonHover: "#6366F1",
    colorBgMenuItemActive: "#E0E7FF",
    colorTextMenuTitle: "#1f2937",
    colorTextMenuItemHover: "#6366F1",
    colorTextMenuSelected: "#4F46E5",
    colorTextMenuActive: "#4F46E5",
    colorBgMenuItemHover: "#EEF2FF",
    colorBgMenuItemSelected: "#E0E7FF",
    colorBgMenuItemCollapsedElevated: "#FFFFFF",
    colorTextMenu: "#374151",
    colorBgMenu: "#FFFFFF",
    colorTextMenuSecondary: "#6B7280",
    colorMenuItemDivider: "#E5E7EB",
    width: 280,
    collapsedWidth: 80,
    borderRadius: 0,
    boxShadow: "2px 0 8px rgba(99, 102, 241, 0.06)",
    paddingInline: 16,
    paddingBlock: 24,
    menuItemHeight: 44,
    menuItemBorderRadius: 8,
    menuItemPadding: "12px 16px",
    menuItemMargin: "4px 0",
    menuItemFontWeight: 500,
    menuItemFontSize: 15,
    menuItemIconSize: 20,
    menuGroupTitleColor: "#9CA3AF",
    menuGroupTitleFontSize: 12,
    menuGroupTitleFontWeight: 600,
    menuGroupTitleTextTransform: "uppercase",
    menuGroupTitleLetterSpacing: "0.05em",
    menuGroupTitleMargin: "24px 0 12px 0",
  },
  card: {
    borderRadius: 16,
    padding: 24,
    paddingLG: 32,
    boxShadow:
      "0 4px 6px rgba(99, 102, 241, 0.07), 0 1px 3px rgba(99, 102, 241, 0.1)",
    borderColor: "#F1F5F9",
    headerHeight: 64,
    headerPadding: "20px 24px",
    headerFontSize: 18,
    headerFontWeight: 600,
    headerBorderBottom: "1px solid #F1F5F9",
  },
  button: {
    borderRadius: 10,
    paddingInline: 20,
    paddingBlock: 12,
    fontWeight: 600,
    fontSize: 15,
    letterSpacing: "0.025em",
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow:
      "0 2px 8px rgba(99, 102, 241, 0.2), 0 1px 3px rgba(99, 102, 241, 0.3)",
    hoverTransform: "translateY(-2px)",
    hoverBoxShadow:
      "0 4px 20px rgba(99, 102, 241, 0.3), 0 2px 8px rgba(99, 102, 241, 0.4)",
    activeTransform: "translateY(-1px)",
  },
  form: {
    itemMarginBottom: 20,
    labelFontWeight: 500,
    labelFontSize: 14,
    labelColor: "#374151",
    labelMarginBottom: 8,
    inputBorderRadius: 10,
    inputPaddingInline: 16,
    inputPaddingBlock: 12,
    inputFontSize: 15,
    inputBorderColor: "#D1D5DB",
    inputBorderColorHover: "#6366F1",
    inputBorderColorFocus: "#6366F1",
    inputBoxShadowFocus: "0 0 0 3px rgba(99, 102, 241, 0.1)",
    helpTextColor: "#6B7280",
    helpTextFontSize: 13,
    errorColor: "#EF4444",
    errorBorderColor: "#EF4444",
    errorBoxShadowFocus: "0 0 0 3px rgba(239, 68, 68, 0.1)",
  },
};

// Main hook untuk semua config
export const useRekonConfig = () => {
  const buttonConfig = useButtonConfig();
  const themeConfig = useThemeConfig();
  const localeConfig = getLocaleConfig();

  return {
    button: buttonConfig,
    theme: themeConfig,
    locale: localeConfig,
  };
};
