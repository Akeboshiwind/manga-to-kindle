// >> Interfaces

interface BotConfig {
    token: string,
}

interface MangadexConfig {
    username: string,
    password: string,
}

interface Config {
    bot: BotConfig,
    mangadex: MangadexConfig,
}



// >> Ensure required

function getEnv(key: string): string {
    const value = process.env[key];
    if (value === undefined) {
        throw new Error(`${key} must be provided!`);
    }
    return value;
}

export const config: Config = {
    bot: {
        token: getEnv("BOT_TOKEN"),
    },
    mangadex: {
        username: getEnv("MANGADEX_USERNAME"),
        password: getEnv("MANGADEX_PASSWORD"),
    },
}
