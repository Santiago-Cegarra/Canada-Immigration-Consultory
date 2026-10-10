import { describe, expect, it } from "vitest";
import {
  buildAvailability,
  CONSULTATION,
  formatPrice,
  isOfferedSlot,
  weekdayOf,
  zonedTimeToUtc,
} from "./schedule";

const TORONTO = "America/Toronto";

describe("zonedTimeToUtc", () => {
  it("convierte la hora de Toronto con horario de verano (UTC-4)", () => {
    expect(zonedTimeToUtc("2026-10-28", "09:30", TORONTO).toISOString()).toBe(
      "2026-10-28T13:30:00.000Z",
    );
  });

  it("convierte la hora de Toronto con horario estándar (UTC-5)", () => {
    // El horario de verano termina el 1 de noviembre de 2026.
    expect(zonedTimeToUtc("2026-11-04", "09:30", TORONTO).toISOString()).toBe(
      "2026-11-04T14:30:00.000Z",
    );
  });
});

describe("buildAvailability", () => {
  // Viernes 9 de octubre de 2026, 08:00 en Toronto.
  const now = new Date("2026-10-09T12:00:00Z");

  it("solo ofrece miércoles, empezando por el siguiente con antelación", () => {
    const days = buildAvailability(now, new Set());

    expect(days.length).toBeGreaterThan(0);
    expect(days[0].day).toBe("2026-10-14");
    expect(days.every(({ day }) => weekdayOf(day) === 3)).toBe(true);
    expect(days[0].slots).toHaveLength(CONSULTATION.startTimes.length);
  });

  it("marca como no disponible un horario ya reservado", () => {
    const taken = zonedTimeToUtc("2026-10-14", "11:15", TORONTO).toISOString();
    const [first] = buildAvailability(now, new Set([taken]));

    expect(first.slots.find((slot) => slot.start === taken)?.available).toBe(
      false,
    );
    expect(first.slots.filter((slot) => slot.available)).toHaveLength(
      CONSULTATION.startTimes.length - 1,
    );
  });

  it("no ofrece horarios dentro de la antelación mínima de 24 h", () => {
    // Martes 13 de octubre, 16:00 en Toronto: solo quedan los de las 16:15 y 18:00.
    const tuesdayAfternoon = new Date("2026-10-13T20:00:00Z");
    const [first] = buildAvailability(tuesdayAfternoon, new Set());

    expect(first.day).toBe("2026-10-14");
    expect(first.slots.map((slot) => slot.start)).toEqual([
      zonedTimeToUtc("2026-10-14", "16:15", TORONTO).toISOString(),
      zonedTimeToUtc("2026-10-14", "18:00", TORONTO).toISOString(),
    ]);
  });
});

describe("isOfferedSlot", () => {
  const now = new Date("2026-10-09T12:00:00Z");

  it("acepta un horario de la agenda", () => {
    expect(
      isOfferedSlot(zonedTimeToUtc("2026-10-21", "14:30", TORONTO), now),
    ).toBe(true);
  });

  it("rechaza una hora que no está en la agenda", () => {
    expect(
      isOfferedSlot(zonedTimeToUtc("2026-10-21", "10:00", TORONTO), now),
    ).toBe(false);
  });

  it("rechaza un día que no es miércoles", () => {
    expect(
      isOfferedSlot(zonedTimeToUtc("2026-10-22", "09:30", TORONTO), now),
    ).toBe(false);
  });

  it("rechaza fechas pasadas, fuera del horizonte o inválidas", () => {
    expect(
      isOfferedSlot(zonedTimeToUtc("2026-10-07", "09:30", TORONTO), now),
    ).toBe(false);
    expect(
      isOfferedSlot(zonedTimeToUtc("2027-03-03", "09:30", TORONTO), now),
    ).toBe(false);
    expect(isOfferedSlot(new Date("no-es-fecha"), now)).toBe(false);
  });
});

describe("formatPrice", () => {
  it("formatea el precio con la moneda", () => {
    expect(formatPrice(15_000)).toBe("$150.00 CAD");
  });
});
