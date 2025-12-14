import { CustomLogger } from "../../shared/custom-logger";

const logger = new CustomLogger(__filename);

const RateLimitEvent = {
    name: "rateLimit",
    label: 'Rate Limit',
    once: false,
    async execute(info: { route: any; limit: any; timeout: any; global: any; }) {
        logger.warn(`Rate Limit Hit: Request on ${info.route} with limit ${info.limit}`);
        logger.warn(`Timeout: ${info.timeout}ms`);
        logger.warn(`Global: ${info.global}`);
    }
}

export default RateLimitEvent;