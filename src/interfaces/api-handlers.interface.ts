export interface IAPIHandlers {
    get_room_data: (code: string) => Promise<any | undefined>;
    get_token_data: (token: string) => Promise<any | undefined>;
    get_user_data: (username: string) => Promise<any | undefined>;
    get_leaderboard_data: (monthly?: boolean) => Promise<any[] | undefined>;
    get_site_statistics: () => Promise<any | undefined>;
    get_public_rooms: (filter_type?: string | null) => Promise<any | undefined>;
    get_articles: () => Promise<any | undefined>;
    get_article_by_id: (id: string) => Promise<any | undefined>;
    get_article_by_phrase: (phrase: string) => Promise<any | null | undefined>;
    get_ollie_picture: () => Promise<string | null | undefined>;
}