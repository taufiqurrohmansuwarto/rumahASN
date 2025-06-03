import React, { forwardRef } from "react";
import { PageContainer as AntdPageContainer } from "@ant-design/pro-layout";
import { useFontJakarta } from "@/styles/fonts";

const PageContainer = forwardRef(({ children, style, ...props }, ref) => {
  const combinedStyle = {
    fontFamily: useFontJakarta(),
    ...style,
  };

  return (
    <AntdPageContainer ref={ref} style={combinedStyle} {...props}>
      {children}
    </AntdPageContainer>
  );
});

PageContainer.displayName = "PageContainer";

export default PageContainer;
