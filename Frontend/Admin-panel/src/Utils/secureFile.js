import api from "../Api/axios";

/**
 * Fetches a protected file via Axios with Bearer auth and creates an in-memory Blob URL.
 * Caller is responsible for revoking `blobUrl` with `URL.revokeObjectURL(blobUrl)` when done.
 */
export async function fetchSecureFile(endpoint) {
  const response = await api.get(endpoint, { responseType: "blob" });
  const contentType = response.headers?.["content-type"] || response.data?.type || "";
  const blobUrl = URL.createObjectURL(response.data);
  return { blobUrl, contentType };
}

/**
 * Downloads a protected file via authenticated API request and opens it in a new tab.
 */
export async function openSecureFileInNewTab(endpoint) {
  const { blobUrl } = await fetchSecureFile(endpoint);
  window.open(blobUrl, "_blank", "noopener,noreferrer");
  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 60000);
}
