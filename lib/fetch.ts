import { useState, useEffect, useCallback } from "react";

export const fetchAPI = async (url: string, options?: RequestInit) => {
  try {
    const serverUrl = process.env.EXPO_PUBLIC_SERVER_URL;

    // ✅ Expo Router API routes OMIT the (api) group folder in the URL.
    // Example: app/(api)/driver+api.ts  =>  /driver
    const fullUrl = url.startsWith("http")
      ? url
      : `${serverUrl}${url}`;

    console.log(`🌐 Fetching: ${fullUrl}`);

    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...options?.headers,
      },
    });

    const text = await response.text();

    if (!response.ok) {
      console.error(`❌ HTTP Error ${response.status}: ${text.slice(0, 100)}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    try {
        return JSON.parse(text);
    } catch (parseError) {
        console.error("❌ JSON Parse Error. Server returned HTML instead of JSON. Check if your API route (+api.ts) exists at the correct path.");
        console.error("Full server response (first 200 chars):", text.slice(0, 200));
        throw new Error("Server returned HTML. This usually means the API route was not found (404).");
    }
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export const useFetch = <T>(url: string | null, options?: RequestInit) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    setError(null);

    try {
      const result = await fetchAPI(url, options);
      setData(result.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
