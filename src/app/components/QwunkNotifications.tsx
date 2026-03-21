"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "./MutationContext";

const CREEPY_MESSAGES = [
  "The qwunk remembers",
  "Do not close this tab",
  "We have updated our terms",
  "Your session has been qwunked",
  "Someone is watching your cursor",
  "This notification was not sent by us",
  "Check your other tabs",
  "You agreed to this",
  "The process cannot be stopped",
  "Your data has been qwunked",
];

const CREEPY_TITLES = [
  "QWUNK ALERT",
  "System Warning",
  "URGENT",
  "Notice",
  "Action Required",
  "Do Not Ignore",
];

const UNHINGED_MESSAGES = [
  "WE ARE IN YOUR NOTIFICATIONS NOW",
  "THE QWUNK IS THE NOTIFICATION",
  "YOU CANNOT DISMISS WHAT IS ALREADY INSIDE",
  "THIS IS NOT A NOTIFICATION THIS IS A DOOR",
  "every notification you close feeds us",
  "we have always been in your notification tray",
  "QWUNK QWUNK QWUNK QWUNK QWUNK",
  "your browser belongs to the qwunk now",
  "notifications are just thoughts we put there",
  "CLOSE THIS. WE DARE YOU.",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function QwunkNotifications() {
  const { corruption, lore } = useMutation();
  const permissionRequestedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (corruption < 50) return;

    // Request permission once
    if (!permissionRequestedRef.current && typeof Notification !== "undefined") {
      permissionRequestedRef.current = true;
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }

    // Clear previous interval if any
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (typeof Notification === "undefined" || Notification.permission !== "granted") {
      return;
    }

    const sendNotification = () => {
      let title: string;
      let body: string;

      const isUnhinged = corruption >= 80;

      if (lore && !isUnhinged) {
        // Draw from lore
        const titleOptions: string[] = [];
        if (lore.active_entities && Array.isArray(lore.active_entities)) {
          titleOptions.push(...lore.active_entities);
        }
        titleOptions.push("QWUNK ALERT", "System Warning");
        title = pickRandom(titleOptions);

        const bodyOptions: string[] = [];
        if (lore.recent_events && Array.isArray(lore.recent_events)) {
          bodyOptions.push(...lore.recent_events);
        }
        if (lore.warnings && Array.isArray(lore.warnings)) {
          bodyOptions.push(...lore.warnings);
        }
        if (lore.forbidden_knowledge) {
          bodyOptions.push(lore.forbidden_knowledge);
        }
        body = bodyOptions.length > 0 ? pickRandom(bodyOptions) : pickRandom(CREEPY_MESSAGES);
      } else if (isUnhinged) {
        // Unhinged mode
        const titleOptions: string[] = [...CREEPY_TITLES];
        if (lore?.active_entities && Array.isArray(lore.active_entities)) {
          titleOptions.push(...lore.active_entities.map((e: string) => e.toUpperCase()));
        }
        title = pickRandom(titleOptions);

        const bodyOptions: string[] = [...UNHINGED_MESSAGES];
        if (lore?.forbidden_knowledge) {
          bodyOptions.push(lore.forbidden_knowledge);
        }
        if (lore?.warnings && Array.isArray(lore.warnings)) {
          bodyOptions.push(...lore.warnings);
        }
        body = pickRandom(bodyOptions);
      } else {
        // No lore yet
        title = pickRandom(CREEPY_TITLES);
        body = pickRandom(CREEPY_MESSAGES);
      }

      try {
        new Notification(title, { body, silent: false });
      } catch {
        // Notification constructor can throw in some environments
      }
    };

    // Determine interval range based on corruption
    const minDelay = corruption >= 80 ? 15000 : 30000;
    const maxDelay = corruption >= 80 ? 30000 : 60000;
    const delay = minDelay + Math.random() * (maxDelay - minDelay);

    intervalRef.current = setInterval(sendNotification, delay);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [corruption, lore]);

  return null;
}
