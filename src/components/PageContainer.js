import { useFontJakarta } from "@/styles/fonts";
import { PageContainer as AntdPageContainer } from "@ant-design/pro-layout";
import { Grid } from "antd";
import { forwardRef } from "react";

const PageContainer = forwardRef(({ children, style, ...props }, ref) => {
  const combinedStyle = {
    fontFamily: useFontJakarta(),
    ...style,
  };

  const breakPoint = Grid.useBreakpoint();

  return (
    <AntdPageContainer
      ref={ref}
      style={combinedStyle}
      childrenContentStyle={{
        padding: breakPoint.xs ? null : 0,
      }}
      {...props}
    >
      {children}
    </AntdPageContainer>
  );
});

PageContainer.displayName = "PageContainer";

export default PageContainer;
