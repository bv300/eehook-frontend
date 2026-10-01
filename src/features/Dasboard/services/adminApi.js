import client from "../../../lib/ApiClient";

export const ADMIN_BASE = "/admin/manage";

export const resourceUrl = (resource, id = "") =>
    `${ADMIN_BASE}/${resource}/${id ? `${id}/` : ""}`;

export const listResource = (resource, params = {}) =>
    client.get(resourceUrl(resource), { params });

export const getResource = (resource, id) =>
    client.get(resourceUrl(resource, id));

export const createResource = (resource, data) =>
    client.post(resourceUrl(resource), data);

export const updateResource = (resource, id, data) =>
    client.patch(resourceUrl(resource, id), data);

export const deleteResource = (resource, id) =>
    client.delete(resourceUrl(resource, id));

export const unwrapList = (payload) => {
    if (Array.isArray(payload)) return { rows: payload, count: payload.length };
    const rows = payload?.results || payload?.items || payload?.data || [];
    return {
        rows: Array.isArray(rows) ? rows : [],
        count: payload?.count ?? payload?.total ?? payload?.total_count ?? rows.length,
        next: payload?.next,
        previous: payload?.previous,
    };
};

export const normalizeSchema = (payload) => {
    if (!payload) return {};
    return payload.fields || payload.models || payload.schema || payload;
};

export const getFieldSchema = (schema, resource) => {
    const normalized = normalizeSchema(schema);
    if (Array.isArray(normalized?.resources)) return normalized.resources.find((item) => item.key === resource || item.key === resource.replaceAll("_", "-")) || {};
    return normalized?.[resource] || normalized?.[resource.replaceAll("-", "_")] || {};
};

export const getErrorMessage = (error, fallback = "Something went wrong") => {
    const data = error?.response?.data;
    if (typeof data === "string") return data;
    if (data?.detail) return data.detail;
    if (data?.message) return data.message;
    if (data && typeof data === "object") {
        return Object.entries(data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
            .join(" | ");
    }
    return fallback;
};
