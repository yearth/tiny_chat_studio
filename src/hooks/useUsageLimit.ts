import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

// 定义游客和登录用户的使用限制
const GUEST_LIMIT = 10;
const USER_LIMIT = 50;

export function useUsageLimit() {
  const { data: session } = useSession();
  const [usageCount, setUsageCount] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // 从API或本地存储加载使用次数
  useEffect(() => {
    const fetchUsage = async () => {
      setIsLoading(true);
      try {
        // 从API获取使用量
        const response = await fetch('/api/usage');
        if (response.ok) {
          const data = await response.json();
          setUsageCount(data.count);
          setIsLimitReached(data.isLimitReached);
        } else {
          // 如果API调用失败，回退到本地存储
          fallbackToLocalStorage();
        }
      } catch (error) {
        console.error('获取使用量失败:', error);
        // 如果API调用失败，回退到本地存储
        fallbackToLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };
    
    // 从本地存储获取使用量（作为备用）
    const fallbackToLocalStorage = () => {
      const today = new Date().toISOString().split('T')[0];
      const storageKey = session?.user ? `user_usage_${session.user.id}_${today}` : `guest_usage_${today}`;
      const usage = localStorage.getItem(storageKey);
      
      if (usage) {
        const count = parseInt(usage, 10);
        setUsageCount(count);
        setIsLimitReached(count >= (session?.user ? USER_LIMIT : GUEST_LIMIT));
      } else {
        setUsageCount(0);
        setIsLimitReached(false);
      }
    };
    
    fetchUsage();
  }, [session]);
  
  // 增加使用计数
  const incrementUsage = async (): Promise<boolean> => {
    try {
      // 通过API增加使用量
      const response = await fetch('/api/usage', {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsageCount(data.count);
        setIsLimitReached(data.isLimitReached);
        return !data.isLimitReached;
      } else {
        // 如果API调用失败，回退到本地存储
        return incrementLocalUsage();
      }
    } catch (error) {
      console.error('增加使用量失败:', error);
      // 如果API调用失败，回退到本地存储
      return incrementLocalUsage();
    }
  };
  
  // 在本地存储中增加使用量（作为备用）
  const incrementLocalUsage = (): boolean => {
    const today = new Date().toISOString().split('T')[0];
    const storageKey = session?.user ? `user_usage_${session.user.id}_${today}` : `guest_usage_${today}`;
    const currentUsage = parseInt(localStorage.getItem(storageKey) || '0', 10);
    const newUsage = currentUsage + 1;
    
    localStorage.setItem(storageKey, newUsage.toString());
    setUsageCount(newUsage);
    
    const limit = session?.user ? USER_LIMIT : GUEST_LIMIT;
    const reached = newUsage >= limit;
    setIsLimitReached(reached);
    
    return !reached;
  };
  
  // 获取当前限制
  const getLimit = (): number => {
    return session?.user ? USER_LIMIT : GUEST_LIMIT;
  };
  
  return { 
    usageCount, 
    isLimitReached, 
    isLoading, 
    incrementUsage,
    limit: getLimit()
  };
}
