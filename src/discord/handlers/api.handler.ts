import axios, { AxiosRequestConfig } from "axios";
import * as K from "../../shared/constants";
import { CustomLogger } from "../../shared/custom-logger";
import config from "../../config/configuration";

const logger = new CustomLogger(__filename);

// ---------------------------
// Helper: Perform GET request
// ---------------------------
async function apiGet<T = any>(url: string, config?: AxiosRequestConfig): Promise<T | undefined> {
    try {
        const response = await axios.get<T>(url, config);
        return response.data;
    } catch (error: any) {
        logger.error(`API GET Error → ${url}`);
        logger.error("Message:", error?.message);
        if (error?.response?.data) logger.error("Response:", error.response.data);
        return undefined;
    }
}

// ---------------------------
// Helper: Intercom config
// ---------------------------
function intercomConfig(): AxiosRequestConfig {
    const token = config.intercom.token;
    if (!token) logger.warn("INTERCOM_TOKEN is not set in environment variables.");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Intercom-Version": "2.10",
        },
    };
}

export const handleAPI = {
    get_room_data: (code: string) =>
        apiGet(K.API_ROOM + code),

    get_token_data: (token: string) =>
        apiGet(K.API_TOKEN + token),

    get_user_data: (username: string) =>
        apiGet(K.API_USER + username),

    get_leaderboard_data: async (monthly = false) => {
        const query = monthly ? "?type=monthly" : "";
        const data = await apiGet<{ ranks: any[] }>(K.API_LEADERBOARD + query);
        return data?.ranks ?? undefined;
    },

    get_site_statistics: () =>
        apiGet(K.API_STATS),

    get_public_rooms: (filter_type: string | null = null) => {
        const query = filter_type ? `?type=${filter_type}` : "";
        return apiGet(K.API_HACKTIVITIES + query);
    },

    get_articles: () =>
        apiGet(K.API_GET_ARTICLES, intercomConfig()),

    get_article_by_id: (id: string) =>
        apiGet(K.API_GET_ARTICLES + `/${id}`, intercomConfig()),

    get_article_by_phrase: async (phrase: string) => {
        const url = `${K.API_SEARCH_ARTICLES}?phrase=${phrase}`;
        const data = await apiGet<any>(url, intercomConfig());

        if (!data || data.total_count === 0) return null;
        return data.data?.articles?.[0] ?? null;
    },

    get_ollie_picture: async () => {
        const data = await apiGet<{ status: string; message: string }>(K.API_OLLIE_PICTURE);

        if (!data) return undefined;
        if (data.status !== "success") {
            logger.error("Picture retrieval failed:", data);
            return null;
        }

        return data.message;
    },
};