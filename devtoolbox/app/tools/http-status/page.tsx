"use client";

import { useState, useMemo } from "react";
import { getToolBySlug } from "@/lib/tools-registry";
import ToolLayout from "@/components/ToolLayout";

const tool = getToolBySlug("http-status")!;

interface StatusCode {
  code: number;
  name: string;
  description: string;
  usage: string;
}

const STATUS_CODES: StatusCode[] = [
  // 1xx
  { code: 100, name: "Continue", description: "The server has received the request headers and the client should proceed to send the request body.", usage: "Large file uploads, expect header" },
  { code: 101, name: "Switching Protocols", description: "The server is switching protocols as requested by the client.", usage: "WebSocket upgrade" },
  // 2xx
  { code: 200, name: "OK", description: "The request has succeeded.", usage: "Successful GET/POST/PUT requests" },
  { code: 201, name: "Created", description: "The request has been fulfilled and a new resource has been created.", usage: "Successful POST creating a resource" },
  { code: 204, name: "No Content", description: "The server has fulfilled the request but does not need to return a body.", usage: "Successful DELETE, or PUT with no response body" },
  { code: 206, name: "Partial Content", description: "The server is delivering only part of the resource due to a range header.", usage: "Video streaming, large file downloads" },
  // 3xx
  { code: 301, name: "Moved Permanently", description: "The resource has been permanently moved to a new URL.", usage: "URL redirects, domain changes" },
  { code: 302, name: "Found", description: "The resource is temporarily located at a different URL.", usage: "Temporary redirects" },
  { code: 304, name: "Not Modified", description: "The resource has not been modified since the last request.", usage: "Browser caching, conditional requests" },
  { code: 307, name: "Temporary Redirect", description: "The request should be repeated with another URL, preserving the HTTP method.", usage: "Temporary redirects preserving POST method" },
  { code: 308, name: "Permanent Redirect", description: "The request should be repeated with another URL, preserving the HTTP method.", usage: "Permanent redirects preserving POST method" },
  // 4xx
  { code: 400, name: "Bad Request", description: "The server cannot process the request due to client error.", usage: "Invalid JSON, missing required fields" },
  { code: 401, name: "Unauthorized", description: "Authentication is required and has failed or has not been provided.", usage: "Missing or invalid auth token" },
  { code: 403, name: "Forbidden", description: "The server understood the request but refuses to authorize it.", usage: "Insufficient permissions" },
  { code: 404, name: "Not Found", description: "The requested resource could not be found on the server.", usage: "Invalid URL, deleted resource" },
  { code: 405, name: "Method Not Allowed", description: "The HTTP method is not allowed for the requested resource.", usage: "POST to a GET-only endpoint" },
  { code: 408, name: "Request Timeout", description: "The server timed out waiting for the request.", usage: "Slow client connections" },
  { code: 409, name: "Conflict", description: "The request conflicts with the current state of the resource.", usage: "Duplicate entries, version conflicts" },
  { code: 413, name: "Payload Too Large", description: "The request body is larger than the server is willing to process.", usage: "File upload size limits" },
  { code: 422, name: "Unprocessable Entity", description: "The request was well-formed but contains semantic errors.", usage: "Validation errors in API" },
  { code: 429, name: "Too Many Requests", description: "The user has sent too many requests in a given time period.", usage: "Rate limiting, API throttling" },
  // 5xx
  { code: 500, name: "Internal Server Error", description: "The server encountered an unexpected condition.", usage: "Unhandled exceptions, server bugs" },
  { code: 502, name: "Bad Gateway", description: "The server received an invalid response from an upstream server.", usage: "Reverse proxy errors, upstream failures" },
  { code: 503, name: "Service Unavailable", description: "The server is not ready to handle the request.", usage: "Maintenance mode, server overload" },
  { code: 504, name: "Gateway Timeout", description: "The server did not receive a timely response from an upstream server.", usage: "Upstream server timeout" },
];

const GROUPS = [
  { range: "1xx", label: "Informational", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
  { range: "2xx", label: "Success", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-500/10" },
  { range: "3xx", label: "Redirection", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-500/10" },
  { range: "4xx", label: "Client Error", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-500/10" },
  { range: "5xx", label: "Server Error", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10" },
];

function getGroup(code: number) {
  return GROUPS[Math.floor(code / 100) - 1] || GROUPS[4];
}

export default function HttpStatusPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return STATUS_CODES;
    const q = query.toLowerCase();
    return STATUS_CODES.filter(
      (s) => String(s.code).includes(q) || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
    );
  }, [query]);

  const grouped = useMemo(() => {
    const map = new Map<string, StatusCode[]>();
    for (const s of filtered) {
      const key = Math.floor(s.code / 100) + "xx";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return map;
  }, [filtered]);

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by code (404) or name (Not Found)..."
          className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />

        <p className="text-sm text-neutral-500 dark:text-neutral-400">{filtered.length} status code{filtered.length !== 1 ? "s" : ""}</p>

        {GROUPS.map((g) => {
          const codes = grouped.get(g.range);
          if (!codes) return null;
          return (
            <section key={g.range}>
              <h2 className={`text-lg font-semibold mb-3 ${g.color}`}>
                {g.range} — {g.label}
              </h2>
              <div className="space-y-2">
                {codes.map((s) => {
                  const grp = getGroup(s.code);
                  return (
                    <div key={s.code} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                      <div className="flex items-start gap-3">
                        <span className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-sm font-bold ${grp.bg} ${grp.color}`}>
                          {s.code}
                        </span>
                        <div>
                          <h3 className="font-medium text-neutral-900 dark:text-white">{s.name}</h3>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{s.description}</p>
                          <p className="text-xs text-neutral-400 mt-1"><strong>Common use:</strong> {s.usage}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </ToolLayout>
  );
}
