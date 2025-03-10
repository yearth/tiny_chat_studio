// 日志记录功能

/**
 * 添加一个简单的日志函数，确保日志能够正确输出
 * @param args 要记录的参数
 */
export function logToConsole(...args: any[]) {
  console.log("[API ROUTE LOG]", new Date().toISOString(), ...args);
}
