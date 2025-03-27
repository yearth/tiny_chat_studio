import { useLocalStorage } from 'react-use';

/**
 * 欢迎页面存储钩子
 * 用于管理欢迎页面相关的本地存储数据
 */
export function useWelcomeStorage() {
  // 消息内容
  const [welcomeMessage, setWelcomeMessage] = useLocalStorage<string>('welcomeMessage', '');
  
  // 模型 ID
  const [welcomeModelId, setWelcomeModelId] = useLocalStorage<string>('welcomeModelId', '');
  
  // 是否来自欢迎页面的标志
  const [fromWelcome, setFromWelcome] = useLocalStorage<string>('fromWelcome', 'false');
  
  /**
   * 设置欢迎页面的消息内容
   * @param message 消息内容
   */
  const setMessage = (message: string) => {
    setWelcomeMessage(encodeURIComponent(message));
  };
  
  /**
   * 获取欢迎页面的消息内容
   * @returns 解码后的消息内容
   */
  const getMessage = (): string => {
    return welcomeMessage ? decodeURIComponent(welcomeMessage) : '';
  };
  
  /**
   * 设置模型 ID
   * @param modelId 模型 ID
   */
  const setModelId = (modelId: string) => {
    setWelcomeModelId(modelId);
  };
  
  /**
   * 获取模型 ID
   * @returns 模型 ID
   */
  const getModelId = (): string => {
    return welcomeModelId || '';
  };
  
  /**
   * 设置是否来自欢迎页面的标志
   * @param value 标志值 ('true' 或 'false')
   */
  const setIsFromWelcome = (value: boolean) => {
    setFromWelcome(value ? 'true' : 'false');
  };
  
  /**
   * 获取是否来自欢迎页面的标志
   * @returns 是否来自欢迎页面
   */
  const getIsFromWelcome = (): boolean => {
    return fromWelcome === 'true';
  };
  
  /**
   * 清空所有欢迎页面相关的存储
   */
  const clearAll = () => {
    setWelcomeMessage('');
    setWelcomeModelId('');
    setFromWelcome('false');
  };
  
  return {
    // 原始存储值和设置函数
    welcomeMessage,
    welcomeModelId,
    fromWelcome,
    setWelcomeMessage,
    setWelcomeModelId,
    setFromWelcome,
    
    // 便捷方法
    setMessage,
    getMessage,
    setModelId,
    getModelId,
    setIsFromWelcome,
    getIsFromWelcome,
    clearAll
  };
}
