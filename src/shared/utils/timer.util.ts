import { CustomLogger } from "../custom-logger";

const logger = new CustomLogger(__filename);

export async function checkDate(day: number | undefined, month: number, year: number, time: number | undefined) {
  try {
    const adjustedMonth = month - 1;

    return new Date(year, adjustedMonth, day, time, 0);
  } catch (error) {
    logger.error("There was an error checking the date:", error);
    return false;
  }
}

export async function getTimeoutDuration(futureDate: { getTime: () => number; }) {
  try {
    const now = new Date();

    const duration = futureDate.getTime() - now.getTime();

    return duration > 0 ? duration : 0;
  } catch (err) {
    logger.error("There was an error getting the timeout duration:", err);
    return false;
  }
}