#!/usr/bin/env node
/**
 * Full-stack API smoke test — run with backend on :4000 and seeded admin.
 * Usage: node scripts/qa-api-smoke.js
 */
const BASE = process.env.QA_API_URL || "http://127.0.0.1:4000/api/v1";
const HEALTH_URL = process.env.QA_HEALTH_URL || "http://127.0.0.1:4000/health";

const EMAIL = process.env.QA_EMAIL || "admin@essethr.local";
const PASSWORD = process.env.QA_PASSWORD || "DevAdmin123!";

const results = [];

async function req(method, path, { body, token, org } = {}) {
  const headers = {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (org) headers["X-Organization"] = org;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, data, ok: res.ok };
}

function record(name, passed, detail = "") {
  results.push({ name, passed, detail });
  const icon = passed ? "✓" : "✗";
  console.log(`${icon} ${name}${detail ? ` — ${detail}` : ""}`);
}

async function main() {
  console.log(`QA API smoke → ${BASE}\n`);

  // Health
  const health = await fetch(HEALTH_URL);
  record("GET /health", health.ok, `status ${health.status}`);

  // Login
  const login = await req("POST", "/users/login", {
    body: { email: EMAIL, password: PASSWORD },
  });
  const token = login.data?.token;
  const org = login.data?.user?.org;
  record(
    "POST /users/login",
    login.ok && Boolean(token),
    login.ok ? `org=${org || "none"}` : JSON.stringify(login.data)?.slice(0, 120),
  );

  if (!token) {
    console.log("\nCannot continue without auth token. Run: npm run seed:all -w backend");
    process.exit(1);
  }

  const authed = { token, org };

  const endpoints = [
    ["GET", "/auth/me", "auth me"],
    ["GET", "/orgs", "orgs list"],
    ["GET", "/employees", "employees"],
    ["GET", "/attendance/all", "attendance all"],
    ["GET", "/leaves", "leaves"],
    ["GET", "/payrolls", "payrolls"],
    ["GET", "/audit-logs", "audit logs"],
    ["GET", "/documents", "documents"],
    ["GET", "/announcements", "announcements"],
    ["GET", "/shifts/templates", "shift templates"],
    ["GET", "/workflows/templates", "workflow templates"],
    ["GET", "/recruitment/jobs", "recruitment jobs"],
    ["GET", "/onboarding/templates", "onboarding templates"],
    ["GET", "/performance/goals", "performance goals"],
    ["GET", "/training/courses", "training courses"],
    ["GET", "/analytics/dashboard", "analytics dashboard"],
    ["GET", "/notifications/inbox", "notifications inbox"],
    ["GET", "/search?q=test", "search"],
    ["GET", "/inbox/work-queue", "work inbox"],
    ["GET", "/ess/me", "ess me"],
  ];

  for (const [method, path, label] of endpoints) {
    const r = await req(method, path, authed);
    const passed = r.status < 500;
    record(`${method} ${path}`, passed, passed ? `status ${r.status}` : JSON.stringify(r.data)?.slice(0, 100));
  }

  if (org) {
    const orgDetail = await req("GET", `/orgs/${org}`, authed);
    record("GET /orgs/:id", orgDetail.ok, `status ${orgDetail.status}`);
  }

  const failed = results.filter((r) => !r.passed);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length) {
    console.log("\nFailures:");
    failed.forEach((f) => console.log(`  - ${f.name}: ${f.detail}`));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
