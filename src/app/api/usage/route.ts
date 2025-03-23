import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { authOptions } from "@/lib/auth-options";

// 游客和登录用户的使用限制
const GUEST_LIMIT = 10;
const USER_LIMIT = 50;

// 获取当前使用量
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (userId) {
    // 登录用户
    const usage = await prisma.usageLimit.findUnique({
      where: {
        userId_date: {
          userId,
          date: today
        }
      }
    });
    
    return NextResponse.json({ 
      count: usage?.count || 0,
      limit: USER_LIMIT,
      isLimitReached: (usage?.count || 0) >= USER_LIMIT
    });
  } else {
    // 游客用户
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    
    const usage = await prisma.usageLimit.findUnique({
      where: {
        ipAddress_date: {
          ipAddress,
          date: today
        }
      }
    });
    
    return NextResponse.json({ 
      count: usage?.count || 0,
      limit: GUEST_LIMIT,
      isLimitReached: (usage?.count || 0) >= GUEST_LIMIT
    });
  }
}

// 增加使用量
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (userId) {
    // 登录用户
    const usage = await prisma.usageLimit.upsert({
      where: {
        userId_date: {
          userId,
          date: today
        }
      },
      update: {
        count: {
          increment: 1
        }
      },
      create: {
        userId,
        date: today,
        count: 1
      }
    });
    
    return NextResponse.json({ 
      count: usage.count,
      limit: USER_LIMIT,
      isLimitReached: usage.count >= USER_LIMIT
    });
  } else {
    // 游客用户
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    
    const usage = await prisma.usageLimit.upsert({
      where: {
        ipAddress_date: {
          ipAddress,
          date: today
        }
      },
      update: {
        count: {
          increment: 1
        }
      },
      create: {
        ipAddress,
        date: today,
        count: 1
      }
    });
    
    return NextResponse.json({ 
      count: usage.count,
      limit: GUEST_LIMIT,
      isLimitReached: usage.count >= GUEST_LIMIT
    });
  }
}
