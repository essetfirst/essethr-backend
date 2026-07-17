function ok(res, data = {}, status = 200) {
  return res.status(status).json({ success: true, ...data });
}

function fail(res, error, status = 400, extra = {}) {
  return res.status(status).json({
    success: false,
    error: typeof error === "string" ? error : error?.message || "Request failed.",
    ...extra,
  });
}

function parsePagination(query = {}, { defaultLimit = 20, maxLimit = 100 } = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const pageSize = Math.min(
    maxLimit,
    Math.max(1, parseInt(query.limit ?? query.pageSize, 10) || defaultLimit),
  );
  const skip = (page - 1) * pageSize;
  return { page, pageSize, skip, limit: pageSize };
}

function paginated(data, { page, pageSize, total }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return {
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

module.exports = { ok, fail, parsePagination, paginated };
