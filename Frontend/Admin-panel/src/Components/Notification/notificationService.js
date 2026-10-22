/**
 * Global Notification Service for Medikto Super Admin Panel
 * Singleton event bus allowing toast triggers from React components, hooks, and async interceptors.
 */

let listeners = [];
let toasts = [];
let counter = 0;

function notifyListeners() {
  const current = [...toasts];
  listeners.forEach((listener) => {
    try {
      listener(current);
    } catch (e) {
      console.error("Error in notification listener:", e);
    }
  });
}

/**
 * Format arguments: supports either (title, description, options) or (message, options)
 */
function parseArgs(type, arg1, arg2, arg3) {
  let title = "";
  let description = "";
  let options = {};

  if (typeof arg1 === "object" && arg1 !== null) {
    title = arg1.title || "";
    description = arg1.description || arg1.message || "";
    options = arg1;
  } else if (typeof arg2 === "string") {
    title = arg1;
    description = arg2;
    options = arg3 || {};
  } else if (typeof arg2 === "object" && arg2 !== null) {
    // Single message with options
    description = arg1;
    options = arg2;
    title = options.title || (type === "success" ? "Success" : type === "error" ? "Error" : type === "warn" ? "Warning" : "Notice");
  } else {
    // Just a string message
    description = arg1 || "";
    title = type === "success" ? "Success" : type === "error" ? "Error" : type === "warn" ? "Warning" : type === "loading" ? "Processing..." : "Notice";
    options = {};
  }

  return { title, description, options };
}

export const notify = {
  subscribe(listener) {
    listeners.push(listener);
    listener([...toasts]);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  show(type, arg1, arg2, arg3) {
    const { title, description, options } = parseArgs(type, arg1, arg2, arg3);
    const id = options.id || `toast-${Date.now()}-${++counter}`;

    // Avoid exact duplicate toasts showing back-to-back
    const existingIndex = toasts.findIndex((t) => t.id === id);

    const toastItem = {
      id,
      type,
      title: title || (type === "success" ? "Success" : type === "error" ? "Error" : ""),
      description: description || "",
      duration: options.duration !== undefined ? options.duration : type === "error" ? 7000 : type === "loading" ? 0 : 4500,
      createdAt: Date.now(),
      ...options,
    };

    if (existingIndex >= 0) {
      toasts[existingIndex] = toastItem;
    } else {
      // Prevent identical consecutive duplicate messages
      const isDuplicate = toasts.some(
        (t) => t.type === type && t.title === toastItem.title && t.description === toastItem.description
      );
      if (!isDuplicate) {
        toasts = [toastItem, ...toasts].slice(0, 5); // Keep at most 5 notifications on screen
      }
    }

    notifyListeners();
    return id;
  },

  success(title, description, options) {
    return this.show("success", title, description, options);
  },

  error(title, description, options) {
    return this.show("error", title, description, options);
  },

  loading(title, description, options) {
    return this.show("loading", title, description, { duration: 0, ...options });
  },

  info(title, description, options) {
    return this.show("info", title, description, options);
  },

  warn(title, description, options) {
    return this.show("warn", title, description, options);
  },

  dismiss(id) {
    if (!id) {
      toasts = [];
    } else {
      toasts = toasts.filter((t) => t.id !== id);
    }
    notifyListeners();
  },

  update(id, updates) {
    const idx = toasts.findIndex((t) => t.id === id);
    if (idx >= 0) {
      const existing = toasts[idx];
      toasts[idx] = {
        ...existing,
        ...updates,
        duration: updates.duration !== undefined ? updates.duration : updates.type === "error" ? 7000 : 4500,
        createdAt: Date.now(),
      };
      notifyListeners();
    }
  },
};

/**
 * Drop-in helper matching react-toastify call signatures so existing calls work seamlessly
 */
export const toast = {
  success: (msg, opts) => (typeof msg === "string" && !opts ? notify.success(msg) : notify.success(opts?.title || "Success", msg, opts)),
  error: (msg, opts) => (typeof msg === "string" && !opts ? notify.error(msg) : notify.error(opts?.title || "Error", msg, opts)),
  info: (msg, opts) => (typeof msg === "string" && !opts ? notify.info(msg) : notify.info(opts?.title || "Info", msg, opts)),
  warn: (msg, opts) => (typeof msg === "string" && !opts ? notify.warn(msg) : notify.warn(opts?.title || "Warning", msg, opts)),
  loading: (msg, opts) => (typeof msg === "string" && !opts ? notify.loading(msg) : notify.loading(opts?.title || "Processing...", msg, opts)),
  dismiss: (id) => notify.dismiss(id),
};

export default notify;
