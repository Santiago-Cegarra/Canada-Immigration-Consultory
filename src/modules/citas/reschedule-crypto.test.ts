import { describe, expect, it } from "vitest";
import {
  decryptRescheduleToken,
  encryptRescheduleToken,
  generateRescheduleToken,
  hashRescheduleToken,
} from "./reschedule-crypto";
import {
  buildAvailability,
  formatWeekdaysBanner,
  isOfferedSlot,
  withProfessionalSchedule,
  zonedTimeToUtc,
} from "./schedule";

describe("reschedule-crypto", () => {
  it("genera, cifra y descifra el token de reprogramación", () => {
    const token = generateRescheduleToken();
    const encrypted = encryptRescheduleToken(token);
    const decrypted = decryptRescheduleToken(encrypted);

    expect(decrypted).toBe(token);
    expect(hashRescheduleToken(token)).toBe(hashRescheduleToken(`  ${token} `));
  });
});

describe("withProfessionalSchedule y formatWeekdaysBanner", () => {
  it("adapta la disponibilidad al horario propio de un profesional", () => {
    const customConfig = withProfessionalSchedule({
      timeZone: "America/Toronto",
      weekdays: [1, 4], // lunes y jueves
      startTimes: ["10:00", "15:00"],
    });

    expect(formatWeekdaysBanner(customConfig.weekdays)).toBe(
      "Días de consulta: lunes y jueves",
    );

    const now = new Date("2026-10-09T12:00:00Z"); // Viernes
    const days = buildAvailability(now, new Set(), customConfig);

    // El primer día disponible debe ser lunes 2026-10-12
    expect(days[0]?.day).toBe("2026-10-12");
    expect(days[0]?.slots).toHaveLength(2);

    const mondaySlot = zonedTimeToUtc("2026-10-12", "10:00", "America/Toronto");
    const wednesdaySlot = zonedTimeToUtc(
      "2026-10-14",
      "09:30",
      "America/Toronto",
    );

    expect(isOfferedSlot(mondaySlot, now, customConfig)).toBe(true);
    expect(isOfferedSlot(wednesdaySlot, now, customConfig)).toBe(false);
  });
});
