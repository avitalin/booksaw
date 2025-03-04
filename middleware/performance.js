import compression from 'compression';
import cache from 'express-cache-controller';

export const performanceMiddleware = [
  // 啟用 Gzip 壓縮
  compression(),
  
  // 靜態資源快取
  cache({
    maxAge: 86400, // 24小時
    private: false,
    noStore: false
  }),
  
  // 大文件處理
  express.json({ limit: '10mb' }),
  express.urlencoded({ extended: true, limit: '10mb' })
]; 