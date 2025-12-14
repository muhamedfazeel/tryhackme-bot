import { GuildMember } from "discord.js";
import config from "../../config/configuration";
import { CustomLogger } from "../custom-logger";

const logger = new CustomLogger(__filename);
const { levels, ...roles } = config.roles;
const levelToRoleMap: Record<number, string> = {
    1337: levels.event,
    999: levels.bugHunter,
    998: levels.contributor,
    997: levels.level13,
    21: levels.level21,
    20: levels.level20,
    19: levels.level19,
    18: levels.level18,
    17: levels.level17,
    16: levels.level16,
    15: levels.level15,
    14: levels.level14,
    13: levels.level13,
    12: levels.level12,
    11: levels.level11,
    10: levels.level10,
    9: levels.level9,
    8: levels.level8,
    7: levels.level7,
    6: levels.level6,
    5: levels.level5,
    4: levels.level4,
    3: levels.level3,
    2: levels.level2,
    1: levels.level1,
}

export function assignRoles(member: GuildMember, apiData: any) {
    if (apiData.level) {
        const { level } = apiData;
        const newRole = levelToRoleMap[level];

        member.roles.add(roles.verified);

        if (newRole) {

            // Remove other level roles
            for (const role of Object.values(levelToRoleMap)) {
                if (member.roles.cache.has(role) && role !== newRole) {
                    member.roles.remove(role);
                }
            }

            // Add the new role
            if (newRole) {
                member.roles.add(newRole);
            }
        }
    }

    if (apiData.subscribed == 1) {
        member.roles.add(roles.subscriber);
    } else {
        member.roles.remove(roles.subscriber);
    }
}

export function removeRoles(member: GuildMember) {
    // Remove verified role
    member.roles.remove(roles.verified);

    // Remove subscriber role
    member.roles.remove(roles.subscriber);

    // Remove level roles
    for (const role of Object.values(levelToRoleMap)) {
        if (member.roles.cache.has(role)) {
            member.roles.remove(role);
        }
    }
}

export function getRolesForLevel(level: number) {
    return levelToRoleMap[level] || null;
}