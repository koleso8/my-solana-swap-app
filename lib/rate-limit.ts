import { NextRequest } from "next/server";

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 минута
const MAX_REQUESTS = 30; // Максимум 30 запросов в минуту

const requestCounts = new Map<string, { count: number; timestamp: number }>();

export async function rateLimit(req: NextRequest) {
  const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  
  const userRequests = requestCounts.get(ip);
  
  if (!userRequests) {
    requestCounts.set(ip, { count: 1, timestamp: now });
    return { success: true };
  }
  
  if (now - userRequests.timestamp > RATE_LIMIT_WINDOW) {
    requestCounts.set(ip, { count: 1, timestamp: now });
    return { success: true };
  }
  
  if (userRequests.count >= MAX_REQUESTS) {
    return { success: false };
  }
  
  userRequests.count++;
  return { success: true };
}

// Очистка старых записей каждые 5 минут
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requestCounts.entries()) {
    if (now - data.timestamp > RATE_LIMIT_WINDOW * 5) {
      requestCounts.delete(ip);
    }
  }
}, 5 * 60 * 1000);