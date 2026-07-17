/**
 * OpenAPI 3.0 — EssetHR API (expanded; mirrors Zod-validated routes).
 */
module.exports = {
  openapi: "3.0.3",
  info: {
    title: "EssetHR API",
    version: "1.1.0",
    description: "Human Resource Management System REST API",
  },
  servers: [
    { url: "/api/v1", description: "API v1" },
    { url: "/api/v2", description: "API v2 (same handlers during migration)" },
  ],
  paths: {
    "/health": {
      get: { summary: "Health check", responses: { 200: { description: "OK" } } },
    },
    "/users/login": {
      post: {
        summary: "Authenticate user",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Login success with tokens" },
          401: { description: "Invalid credentials" },
          429: { description: "Rate limited or account locked" },
        },
      },
    },
    "/users/refresh": {
      post: {
        summary: "Rotate refresh token",
        tags: ["Auth"],
        responses: { 200: { description: "New tokens" } },
      },
    },
    "/employees": {
      get: {
        summary: "List employees (paginated)",
        tags: ["Employees"],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer" } },
        ],
        responses: { 200: { description: "Paginated employee list" } },
      },
      post: { summary: "Create employee", tags: ["Employees"], responses: { 201: { description: "Created" } } },
    },
    "/employees/{id}": {
      get: { summary: "Get employee", tags: ["Employees"], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }] },
      put: { summary: "Update employee", tags: ["Employees"] },
      delete: { summary: "Delete employee", tags: ["Employees"] },
    },
    "/leaves": {
      get: { summary: "List leaves", tags: ["Leaves"] },
      post: { summary: "Create leave request", tags: ["Leaves"] },
    },
    "/leaves/approve": {
      put: { summary: "Approve leave requests", tags: ["Leaves"] },
    },
    "/offboarding/templates": {
      get: { summary: "List offboarding templates", tags: ["Offboarding"] },
      post: { summary: "Create offboarding template", tags: ["Offboarding"] },
    },
    "/offboarding/instances": {
      get: { summary: "List offboarding cases", tags: ["Offboarding"] },
      post: { summary: "Start offboarding", tags: ["Offboarding"] },
    },
    "/reports/schedules": {
      get: { summary: "List report delivery schedules", tags: ["Reports"] },
      post: { summary: "Create report schedule", tags: ["Reports"] },
    },
    "/audit-logs": {
      get: { summary: "Query audit logs (paginated)", tags: ["Audit"] },
    },
    "/documents": {
      get: { summary: "List documents (paginated)", tags: ["Documents"] },
    },
    "/attendance/all": {
      get: { summary: "Attendance by date range", tags: ["Attendance"] },
    },
    "/inbox/work-queue": {
      get: { summary: "Pending approvals inbox", tags: ["Inbox"] },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      orgHeader: { type: "apiKey", in: "header", name: "X-Organization" },
    },
    schemas: {
      Pagination: {
        type: "object",
        properties: {
          page: { type: "integer" },
          pageSize: { type: "integer" },
          total: { type: "integer" },
          totalPages: { type: "integer" },
          hasNextPage: { type: "boolean" },
          hasPrevPage: { type: "boolean" },
        },
      },
    },
  },
  security: [{ bearerAuth: [], orgHeader: [] }],
};
