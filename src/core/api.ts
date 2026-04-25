import https from "node:https";
import zlib from "node:zlib";
import { API_HOST, API_PATH } from "./constants";

/** 建立 multipart/form-data 請求主體 */
export function buildMultipartBody(storeId: string): { boundary: string; body: string } {
  const boundary = `----WebKitFormBoundary${Math.random().toString(36).slice(2, 14)}`;
  const body = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="storeId"',
    "",
    storeId,
    `--${boundary}--`,
    "",
  ].join("\r\n");

  return { boundary, body };
}

/** 向鼎泰豐 WebApiTest 端點查詢指定門市的叫號資料 */
export function queryApi(storeId: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const { boundary, body } = buildMultipartBody(storeId);

    const req = https.request(
      {
        hostname: API_HOST,
        port: 443,
        path: API_PATH,
        method: "POST",
        headers: {
          Host: "www.dintaifung.tw",
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
          "Content-Length": Buffer.byteLength(body),
          "User-Agent": "curl/8.4.0",
          Accept: "*/*",
          "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
          "Accept-Encoding": "gzip, deflate",
          Connection: "keep-alive",
        },
        timeout: 5000,
        rejectUnauthorized: true,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`API HTTP ${res.statusCode ?? "unknown"}`));
            return;
          }

          const buffer = Buffer.concat(chunks);
          const encoding = res.headers["content-encoding"];

          const parseJson = (buf: Buffer) => {
            try {
              resolve(JSON.parse(buf.toString("utf-8")));
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              reject(new Error(`API 回應無法解析: ${msg}`));
            }
          };

          if (encoding === "gzip") {
            zlib.gunzip(buffer, (err, result) => {
              if (err) { reject(err); return; }
              parseJson(result);
            });
          } else if (encoding === "deflate") {
            zlib.inflate(buffer, (err, result) => {
              if (err) { reject(err); return; }
              parseJson(result);
            });
          } else {
            parseJson(buffer);
          }
        });
      },
    );

    req.on("timeout", () => req.destroy(new Error("API timeout")));
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}
