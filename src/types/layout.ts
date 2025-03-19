// 屏幕尺寸枚举
export enum ScreenSize {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop'
}

// 屏幕尺寸断点（单位：像素）
export const SCREEN_BREAKPOINTS = {
  MOBILE: 640,   // 小于640px为移动设备
  TABLET: 1024,  // 640px-1024px为平板设备
  // 大于1024px为桌面设备
};
