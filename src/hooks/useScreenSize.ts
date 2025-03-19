import { useState, useEffect } from "react";
import { ScreenSize, SCREEN_BREAKPOINTS } from "@/types/layout";

/**
 * 自定义钩子，用于检测和响应屏幕尺寸变化
 * @returns 当前屏幕尺寸类型
 */
export function useScreenSize(): ScreenSize {
  const [screenSize, setScreenSize] = useState<ScreenSize>(ScreenSize.DESKTOP);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < SCREEN_BREAKPOINTS.MOBILE) {
        setScreenSize(ScreenSize.MOBILE);
      } else if (width < SCREEN_BREAKPOINTS.TABLET) {
        setScreenSize(ScreenSize.TABLET);
      } else {
        setScreenSize(ScreenSize.DESKTOP);
      }
    };

    // 初始检查
    checkScreenSize();

    // 监听窗口大小变化
    window.addEventListener("resize", checkScreenSize);

    // 清理函数
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return screenSize;
}
