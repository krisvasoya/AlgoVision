import type { UsabilityEvent, UsabilityEventType } from "./types.ts";

export class UsabilityTracker {
  private static STORAGE_KEY = "algovision_usability_events";

  public static trackEvent(type: UsabilityEventType, details?: Record<string, unknown>): UsabilityEvent {
    const event: UsabilityEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      details,
      timestamp: Date.now(),
    };

    if (typeof window !== "undefined") {
      try {
        const existing = this.getEvents();
        existing.unshift(event);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existing.slice(0, 50)));
      } catch {
        // Safe fallback
      }
    }

    return event;
  }

  public static getEvents(): UsabilityEvent[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    return [];
  }

  public static clearEvents() {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(this.STORAGE_KEY);
      } catch {
        // Fallback
      }
    }
  }

  public static resetFirstTimeUserState() {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("algovision_student_progress");
        localStorage.removeItem(this.STORAGE_KEY);
      } catch {
        // Fallback
      }
    }
  }
}
