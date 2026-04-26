import { Torneo } from "../models/torneo.model";

export interface CronogramaPartido {
  fase: string;
  numeroPartido: number;
  fecha: Date;
}

const ROUNDS_LABELS: Record<number, string> = {
  16: "octavos",
  12: "octavos",
  8: "cuartos",
  4: "semifinal",
  2: "final",
};

type MatchDescriptor = Omit<CronogramaPartido, "fecha">;

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const SATURDAY = 6;

const getNextSaturday = (date: Date): Date => {
  const nextSaturday = new Date(date);
  const day = nextSaturday.getDay();
  const daysUntilSaturday = (SATURDAY - day + 7) % 7;
  nextSaturday.setDate(nextSaturday.getDate() + daysUntilSaturday);
  nextSaturday.setHours(0, 0, 0, 0);
  return nextSaturday;
};

const buildSaturdaySlots = (
  start: Date,
  end: Date,
  slotsNeeded: number
): Date[] => {
  const slots: Date[] = [];
  const firstSaturday = getNextSaturday(start);
  const lastSaturday = getNextSaturday(end);

  for (
    let current = new Date(firstSaturday);
    current.getTime() <= lastSaturday.getTime();
    current = new Date(current.getTime() + 7 * DAY_IN_MS)
  ) {
    slots.push(new Date(current));
  }

  while (slots.length < slotsNeeded) {
    const previous = slots[slots.length - 1] ?? firstSaturday;
    slots.push(new Date(previous.getTime() + 7 * DAY_IN_MS));
  }

  return slots;
};

const generarMatchesEliminatorio = (
  cantidadEquipos: number
): MatchDescriptor[] => {
  const fixtures: MatchDescriptor[] = [];
  let equiposActivos = cantidadEquipos;

  while (equiposActivos > 1) {
    const partidosEstaFase = Math.max(1, Math.floor(equiposActivos / 2));
    const fase = ROUNDS_LABELS[equiposActivos] || `fase_${equiposActivos}`;

    for (let i = 0; i < partidosEstaFase; i += 1) {
      fixtures.push({
        fase,
        numeroPartido: i + 1,
      });
    }

    equiposActivos = Math.max(1, Math.floor(equiposActivos / 2));
  }

  return fixtures;
};

const generarMatchesTodosContraTodos = (
  cantidadEquipos: number
): MatchDescriptor[] => {
  const fixtures: MatchDescriptor[] = [];
  let numeroPartido = 1;

  for (let i = 1; i <= cantidadEquipos; i += 1) {
    for (let j = i + 1; j <= cantidadEquipos; j += 1) {
      fixtures.push({
        fase: "todos_contra_todos",
        numeroPartido,
      });
      numeroPartido += 1;
    }
  }

  return fixtures;
};

export const generarCronogramaTentativo = (
  torneo: Torneo
): CronogramaPartido[] => {
  if (
    !torneo.fecha_inicio ||
    !torneo.fecha_fin ||
    !torneo.cantidad_equipos ||
    torneo.cantidad_equipos < 2
  ) {
    return [];
  }

  const descriptors =
    torneo.tipo === "eliminatorio"
      ? generarMatchesEliminatorio(torneo.cantidad_equipos)
      : generarMatchesTodosContraTodos(torneo.cantidad_equipos);

  if (descriptors.length === 0) {
    return [];
  }

  const start = new Date(Math.min(torneo.fecha_inicio.getTime(), torneo.fecha_fin.getTime()));
  const end = new Date(Math.max(torneo.fecha_inicio.getTime(), torneo.fecha_fin.getTime()));

  const phases: string[] = [];
  const phaseOrder = new Map<string, number>();
  descriptors.forEach((descriptor) => {
    if (!phaseOrder.has(descriptor.fase)) {
      phaseOrder.set(descriptor.fase, phaseOrder.size);
      phases.push(descriptor.fase);
    }
  });

  const totalPhases = phases.length;
  const saturdaySlots = buildSaturdaySlots(start, end, totalPhases);
  const phaseDates = phases.map((_, index) => {
    if (totalPhases === 1) {
      return new Date(saturdaySlots[0]);
    }

    const slotIndex = Math.round(
      (index * (saturdaySlots.length - 1)) / (totalPhases - 1)
    );
    return new Date(saturdaySlots[slotIndex]);
  });

  const phaseCounts = descriptors.reduce((acc, descriptor) => {
    acc[descriptor.fase] = (acc[descriptor.fase] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const phaseIndices: Record<string, number> = {};

  return descriptors.map((descriptor) => {
    const count = phaseCounts[descriptor.fase] || 0;
    const indexWithinPhase = phaseIndices[descriptor.fase] || 0;
    phaseIndices[descriptor.fase] = indexWithinPhase + 1;

    const baseDate =
      phaseDates[phaseOrder.get(descriptor.fase) ?? 0] || new Date(start);

    const date = new Date(baseDate);
    if (count >= 4) {
      const offsetMinutes = indexWithinPhase * 60;
      date.setMinutes(date.getMinutes() + offsetMinutes);
    }

    return {
      ...descriptor,
      fecha: date,
    };
  });
};
