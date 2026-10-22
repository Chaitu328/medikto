/**
 * Centralized API Error Normalizer for Medikto Super Admin Panel
 * Extracts safe, human-readable titles and messages without technical jargon or sensitive info.
 */

export function normalizeApiError(error, defaultFallbackTitle = "Operation failed", defaultFallbackDescription = "") {
  // 1. Connection / Network errors
  if (!error) {
    return {
      title: defaultFallbackTitle,
      description: defaultFallbackDescription || "An unexpected error occurred. Please try again.",
      statusCode: null,
      isNetworkError: false,
    };
  }

  if (error.code === "ERR_NETWORK" || error.message === "Network Error" || !error.response) {
    if (error.code === "ECONNABORTED" || error.message?.toLowerCase().includes("timeout")) {
      return {
        title: "Request timeout",
        description: "The server took too long to respond. Please check your connection and retry.",
        statusCode: 408,
        isNetworkError: true,
      };
    }
    return {
      title: "Unable to connect",
      description: "Unable to connect to the server. Check your connection and retry.",
      statusCode: null,
      isNetworkError: true,
    };
  }

  const { status, data } = error.response;
  let rawMessage = "";

  if (data) {
    if (typeof data === "string") {
      // Avoid displaying raw HTML error pages (e.g. from Nginx or Express default)
      if (data.trim().startsWith("<") || data.includes("<!DOCTYPE") || data.includes("<html")) {
        rawMessage = "";
      } else {
        rawMessage = data;
      }
    } else if (typeof data === "object") {
      rawMessage = data.message || data.error || data.detail || "";
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        rawMessage = data.errors.map((e) => (typeof e === "string" ? e : e.msg || e.message)).filter(Boolean).join(". ");
      }
    }
  }

  // Sanitize internal strings / mongo / stack trace mentions
  if (rawMessage) {
    if (rawMessage.includes("MongoError") || rawMessage.includes("E11000") || rawMessage.includes("Cast to ObjectId")) {
      if (rawMessage.includes("email")) {
        rawMessage = "An account with this email address already exists.";
      } else if (rawMessage.includes("phone")) {
        rawMessage = "A user with this phone number already exists.";
      } else {
        rawMessage = "A database conflict occurred with the submitted information.";
      }
    }
    // Remove internal stack traces or path disclosures
    if (rawMessage.includes("at ") && rawMessage.includes(".js:")) {
      rawMessage = "The server encountered an error processing your request.";
    }
  }

  let title = defaultFallbackTitle;
  let description = rawMessage || defaultFallbackDescription;

  switch (status) {
    case 400:
      if (!title || title === "Operation failed") {
        title = "Invalid information";
      }
      if (!description) {
        description = "Please review the form fields and ensure all required information is valid.";
      }
      break;

    case 401:
      title = "Session expired";
      description = "Your session has expired. Please log in again to continue.";
      break;

    case 403:
      title = "Permission denied";
      description = rawMessage || "You do not have permission to perform this action.";
      break;

    case 404:
      title = "Record not found";
      description = rawMessage || "The requested item or resource could not be found.";
      break;

    case 409:
      title = "Duplicate record";
      description = rawMessage || "A conflicting record with this information already exists.";
      break;

    case 422:
      title = "Validation error";
      description = rawMessage || "Some submitted fields contain invalid values.";
      break;

    case 500:
    case 502:
    case 503:
    case 504:
      title = "Server error";
      description = "The server could not process the request. Please try again later.";
      break;

    default:
      if (!description) {
        description = "The operation could not be completed. Please try again.";
      }
      break;
  }

  return {
    title,
    description,
    statusCode: status,
    isDuplicate: status === 409 || description.toLowerCase().includes("already exists"),
    isNetworkError: false,
    raw: rawMessage,
  };
}

export default normalizeApiError;
