import { useMemo } from "react";

export default function useFormErrors(error) {
    return useMemo(() => {
        const payload = error?.response?.data;
        if (!payload || typeof payload !== "object") return {};
        return Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, Array.isArray(value) ? value.join(", ") : String(value)]));
    }, [error]);
}
