"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Key,
  Lock,
  Lightning,
  Cube,
  Package,
  Books,
  Copy,
  Check,
  CaretDown,
  CaretRight,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import Link from "next/link";

interface EndpointProps {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  requestBody?: string;
  responseBody: string;
  auth: boolean;
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-blue-100 text-blue-700",
    POST: "bg-green-100 text-green-700",
    PUT: "bg-amber-100 text-amber-700",
    DELETE: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${colors[method] || "bg-gray-100 text-gray-700"}`}>
      {method}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 text-white/40 hover:text-white/80 transition-colors"
      aria-label="Copy code"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

function EndpointCard({ method, path, description, requestBody, responseBody, auth }: EndpointProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full p-4 sm:p-5 text-left hover:bg-[#F5F6F8]/50 transition-colors"
      >
        <MethodBadge method={method} />
        <code className="text-sm font-semibold text-[#0B4228] font-mono">{path}</code>
        {auth && <Lock size={12} className="text-[#8B95A5]" />}
        <span className="flex-1 text-sm text-[#8B95A5] truncate hidden sm:block">{description}</span>
        {expanded ? (
          <CaretDown size={14} className="text-[#8B95A5] shrink-0" />
        ) : (
          <CaretRight size={14} className="text-[#8B95A5] shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 sm:px-5 py-4 space-y-4">
          <p className="text-sm text-[#8B95A5]">{description}</p>

          {requestBody && (
            <div>
              <p className="text-xs font-bold text-[#0B4228] mb-2 uppercase tracking-wider">Request Body</p>
              <div className="relative rounded-xl bg-[#0B4228] p-4 overflow-x-auto">
                <CopyButton text={requestBody} />
                <pre className="text-xs text-white/80 leading-relaxed font-mono"><code>{requestBody}</code></pre>
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-bold text-[#0B4228] mb-2 uppercase tracking-wider">Response</p>
            <div className="relative rounded-xl bg-[#0B4228] p-4 overflow-x-auto">
              <CopyButton text={responseBody} />
              <pre className="text-xs text-white/80 leading-relaxed font-mono"><code>{responseBody}</code></pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const endpoints: EndpointProps[] = [
  {
    method: "POST",
    path: "/v1/optimize",
    description: "Run a packing optimization for selected items and carrier.",
    auth: true,
    requestBody: `{
  "items": [
    { "id": "item_abc123", "quantity": 3 },
    { "id": "item_def456", "quantity": 1 }
  ],
  "carrier": "FEDEX",
  "optimizeFor": "COST",
  "fillMaterial": "AIR_PILLOWS",
  "includeFlatRate": true,
  "maxBoxes": 10
}`,
    responseBody: `{
  "totalCost": 12.45,
  "naiveCost": 18.90,
  "savingsAmount": 6.45,
  "savingsPercent": 34.1,
  "packedBoxes": [
    {
      "boxId": "box_med_12x10x8",
      "boxName": "Medium 12\u00d710\u00d78",
      "placements": [...],
      "dimWeight": 4.2,
      "actualWeight": 3.1,
      "billedWeight": 4.2,
      "surcharges": []
    }
  ]
}`,
  },
  {
    method: "GET",
    path: "/v1/items",
    description: "List all items in your catalog.",
    auth: true,
    responseBody: `[
  {
    "id": "item_abc123",
    "sku": "MUG-01",
    "name": "Ceramic Mug",
    "width": 100,
    "height": 95,
    "depth": 100,
    "weight": 340,
    "isFragile": true,
    "canRotate": false
  }
]`,
  },
  {
    method: "POST",
    path: "/v1/items",
    description: "Create a new item in your catalog.",
    auth: true,
    requestBody: `{
  "sku": "PLATE-LG",
  "name": "Large Dinner Plate",
  "width": 280,
  "height": 25,
  "depth": 280,
  "weight": 520,
  "isFragile": true,
  "canRotate": true,
  "maxStackWeight": 2000
}`,
    responseBody: `{
  "id": "item_ghi789",
  "sku": "PLATE-LG",
  "name": "Large Dinner Plate",
  ...
}`,
  },
  {
    method: "GET",
    path: "/v1/box-types",
    description: "List all box types in your inventory.",
    auth: true,
    responseBody: `[
  {
    "id": "box_sm_8x6x4",
    "name": "Small 8\u00d76\u00d74",
    "innerWidth": 203,
    "innerHeight": 152,
    "innerDepth": 102,
    "cost": 0.85,
    "isActive": true
  }
]`,
  },
  {
    method: "POST",
    path: "/v1/box-types",
    description: "Create a new box type.",
    auth: true,
    requestBody: `{
  "name": "Large 18\u00d714\u00d712",
  "innerWidth": 457,
  "innerHeight": 356,
  "innerDepth": 305,
  "wallThickness": 3,
  "boxWeight": 450,
  "maxWeight": 22000,
  "cost": 2.10,
  "isActive": true
}`,
    responseBody: `{
  "id": "box_lg_18x14x12",
  "name": "Large 18\u00d714\u00d712",
  ...
}`,
  },
  {
    method: "GET",
    path: "/v1/carrier-rules/:carrier",
    description: "Get carrier surcharge rules and size/weight limits.",
    auth: true,
    responseBody: `{
  "carrier": "FEDEX",
  "maxLength": 2743,
  "maxGirth": 3302,
  "maxWeight": 68039,
  "dimDivisor": 5000,
  "surcharges": {
    "additionalHandling": {
      "lengthThreshold": 1219,
      "widthThreshold": 762,
      "weightThreshold": 22680,
      "fee": 16.00
    },
    "oversize": {
      "lengthThreshold": 2438,
      "girthThreshold": 3048,
      "fee": 95.00
    }
  }
}`,
  },
  {
    method: "GET",
    path: "/v1/billing/usage",
    description: "Get current billing period usage.",
    auth: true,
    responseBody: `{
  "plan": "growth",
  "optimizationsUsed": 2847,
  "optimizationsLimit": 10000,
  "periodStart": "2026-02-01T00:00:00Z",
  "periodEnd": "2026-02-28T23:59:59Z"
}`,
  },
];

export default function ApiDocsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-[#0B4228]">API Documentation</h2>
        <p className="text-sm text-[#8B95A5]">
          Reference for the PackOptimize REST API. Authenticate all requests with your API key.
        </p>
      </div>

      {/* Auth section */}
      <Card className="rounded-2xl sm:rounded-3xl border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-[#0B4228]">
            <Key size={18} /> Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-[#8B95A5]">
            Include your API key in the <code className="text-xs font-mono bg-[#F5F6F8] px-1.5 py-0.5 rounded text-[#0B4228]">Authorization</code> header:
          </p>
          <div className="relative rounded-xl bg-[#0B4228] p-4 overflow-x-auto">
            <CopyButton text='Authorization: Bearer pk_live_your_api_key_here' />
            <pre className="text-xs text-white/80 font-mono">
              <code>Authorization: Bearer pk_live_your_api_key_here</code>
            </pre>
          </div>
          <p className="text-xs text-[#8B95A5]">
            Create and manage API keys in{" "}
            <Link href="/api-keys" className="text-[#0B4228] font-semibold hover:underline">
              API Keys <ArrowSquareOut size={10} className="inline" />
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* Base URL */}
      <Card className="rounded-2xl sm:rounded-3xl border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-[#0B4228]">
            <Books size={18} /> Base URL
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative rounded-xl bg-[#0B4228] p-4 overflow-x-auto">
            <CopyButton text="https://api.packoptimize.com" />
            <pre className="text-xs text-white/80 font-mono">
              <code>https://api.packoptimize.com</code>
            </pre>
          </div>
          <p className="text-xs text-[#8B95A5] mt-3">
            All endpoints are relative to this base URL. Responses are JSON with <code className="font-mono bg-[#F5F6F8] px-1 rounded">Content-Type: application/json</code>.
          </p>
        </CardContent>
      </Card>

      {/* Rate limits */}
      <Card className="rounded-2xl sm:rounded-3xl border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-[#0B4228]">
            <Lightning size={18} /> Rate Limits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="rounded-xl bg-[#F5F6F8] p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#8B95A5]">Free</p>
              <p className="text-lg font-bold text-[#0B4228] mt-1">100 req/min</p>
            </div>
            <div className="rounded-xl bg-[#F5F6F8] p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#8B95A5]">Growth</p>
              <p className="text-lg font-bold text-[#0B4228] mt-1">500 req/min</p>
            </div>
            <div className="rounded-xl bg-[#F5F6F8] p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#8B95A5]">Enterprise</p>
              <p className="text-lg font-bold text-[#0B4228] mt-1">Custom</p>
            </div>
          </div>
          <p className="text-xs text-[#8B95A5] mt-3">
            Rate limit headers are included in every response: <code className="font-mono bg-[#F5F6F8] px-1 rounded">X-RateLimit-Remaining</code> and <code className="font-mono bg-[#F5F6F8] px-1 rounded">X-RateLimit-Reset</code>.
          </p>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <div>
        <h3 className="text-base font-bold text-[#0B4228] mb-4">Endpoints</h3>
        <div className="space-y-3">
          {endpoints.map((ep) => (
            <EndpointCard key={`${ep.method}-${ep.path}`} {...ep} />
          ))}
        </div>
      </div>

      {/* Error codes */}
      <Card className="rounded-2xl sm:rounded-3xl border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[#0B4228]">Error Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-4 text-[#8B95A5] font-medium text-xs uppercase tracking-wider">Code</th>
                  <th className="text-left py-2 pr-4 text-[#8B95A5] font-medium text-xs uppercase tracking-wider">Meaning</th>
                  <th className="text-left py-2 text-[#8B95A5] font-medium text-xs uppercase tracking-wider">Resolution</th>
                </tr>
              </thead>
              <tbody className="text-[#111827]">
                {[
                  { code: "400", meaning: "Bad Request", resolution: "Check request body against the schema" },
                  { code: "401", meaning: "Unauthorized", resolution: "Include a valid API key in the Authorization header" },
                  { code: "403", meaning: "Forbidden", resolution: "Your API key lacks the required permission" },
                  { code: "404", meaning: "Not Found", resolution: "Check the resource ID or endpoint path" },
                  { code: "422", meaning: "Validation Error", resolution: "One or more fields failed validation — see response details" },
                  { code: "429", meaning: "Rate Limited", resolution: "Back off and retry after X-RateLimit-Reset" },
                  { code: "500", meaning: "Internal Error", resolution: "Retry once, then contact support if persistent" },
                ].map((err) => (
                  <tr key={err.code} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 pr-4 font-mono font-bold text-xs">{err.code}</td>
                    <td className="py-2.5 pr-4 text-sm">{err.meaning}</td>
                    <td className="py-2.5 text-xs text-[#8B95A5]">{err.resolution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
