import * as http from "http";
import * as https from "https";
import * as querystring from "querystring";

/**
 * 格式化URL
 * @param url
 * @param qs
 */
function formatUrl(url: string, qs?: Record<string, any>) {
  const isHttps = url.substr(0, 6).toLowerCase() === "https:";
  if (qs) {
    if (url.indexOf("?") === -1) {
      url += "?" + querystring.stringify(qs);
    } else {
      url += "&" + querystring.stringify(qs);
    }
  }
  return { isHttps, url };
}

/** 默认的请求超时时间 */
export const DEFAULT_TIMEOUT = 60000;

/** 默认的http Agent */
export const DEFAULT_HTTP_AGENT = new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: Infinity,
  maxFreeSockets: 256,
  timeout: DEFAULT_TIMEOUT,
});

/** 默认的https Agent */
export const DEFAULT_HTTPS_AGENT = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: Infinity,
  maxFreeSockets: 256,
  timeout: DEFAULT_TIMEOUT,
});

/** 响应对象 */
export interface Response extends http.IncomingMessage {
  body: any;
}

/** 请求参数 */
export interface RequestOptions {
  /** 请求方法，默认 GET */
  method?: string;
  /** 请求地址 */
  url: string;
  /** QueryString 参数 */
  qs?: Record<string, any>;
  /** 请求体，Buffer 或者 JSON 对象 */
  body?: any;
  /** 预期响应体为 JSON */
  json?: boolean;
  /** 预期响应体为 string */
  text?: boolean;
  /** 请求头 */
  headers?: http.OutgoingHttpHeaders;
}

/**
 * 发送请求
 * @param options
 */
export function request(options: RequestOptions): Promise<Response> {
  return new Promise((resolve, reject) => {
    const method = options.method ? options.method.toUpperCase() : "GET";
    const formatted = formatUrl(options.url, options.qs);
    const opts: http.RequestOptions = {
      method,
      headers: Object.assign({}, options.headers),
      timeout: DEFAULT_TIMEOUT,
      agent: formatted.isHttps ? DEFAULT_HTTPS_AGENT : DEFAULT_HTTP_AGENT,
    };
    const bodyIsBuffer = options.body && Buffer.isBuffer(options.body);
    if (options.body && !bodyIsBuffer) {
      if (!opts.headers!["content-type"]) {
        opts.headers!["content-type"] = "application/json";
      }
    }
    const lib = (formatted.isHttps ? https : http) as typeof http;
    const req = lib.request(formatted.url, opts, res => {
      req.on("error", reject);
      const buffers: any[] = [];
      res.on("data", chunk => buffers.push(chunk));
      res.on("end", () => {
        try {
          const body = Buffer.concat(buffers);
          const res2 = res as Response;
          if (options.text) {
            res2.body = body.toString("utf8");
          } else if (options.json) {
            res2.body = JSON.parse(body.toString("utf8"));
          } else {
            res2.body = body;
          }
          resolve(res2);
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on("error", reject);
    if (options.body) {
      if (bodyIsBuffer) {
        req.end(options.body);
      } else {
        req.end(JSON.stringify(options.body));
      }
    } else {
      req.end();
    }
  });
}
