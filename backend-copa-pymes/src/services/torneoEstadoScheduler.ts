import { FilterQuery } from "@mikro-orm/core";
import { Torneo } from "../models/torneo.model";
import { getORM } from "../shared/db/mikro-orm.config";

const CHECK_INTERVAL_MS = 3000 * 60 * 1000; // cada 3000 minutos

let intervalHandle: NodeJS.Timeout | null = null;
let isRunning = false;

const checkAndMarkFinalizados = async () => {
  if (isRunning) return;
  isRunning = true;

  const orm = getORM();
  const em = orm.em.fork();
  try {
    const ahora = new Date();
    const query: FilterQuery<Torneo> = {
      estado: { $nin: ["finalizado"] },
      fecha_fin: { $ne: null, $lte: ahora },
    };
    const torneos = await em.find(Torneo, query);

    if (!torneos.length) {
      return;
    }

    torneos.forEach((torneo) => {
      torneo.estado = "finalizado";
    });

    await em.flush();
    console.log(`Cron: ${torneos.length} torneo(s) marcados como finalizado automáticamente.`);
  } catch (error: any) {
    console.error("Cron: error actualizando torneos finalizados:", error);
  } finally {
    em.clear();
    isRunning = false;
  }
};

export const startTorneoEstadoScheduler = () => {
  if (intervalHandle) return;
  checkAndMarkFinalizados();
  intervalHandle = setInterval(() => {
    checkAndMarkFinalizados();
  }, CHECK_INTERVAL_MS);
};

export const stopTorneoEstadoScheduler = () => {
  if (!intervalHandle) return;
  clearInterval(intervalHandle);
  intervalHandle = null;
};
