// >> Interfaces

interface BotConfig {
    token: string,
}

interface MangadexConfig {
    username: string,
    password: string,
}

interface EmailConfig {
    email: string,
    password: string,
}

interface Config {
    bot: BotConfig,
    mangadex: MangadexConfig,
    email: EmailConfig,
}



// >> Load config

/**
 * Load given environment variable and throw an exception if it doesn't exist
 * @param {string} key - The environment variable key
 * @return {string} The value of the environment variable
 */
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
    email: {
        email: getEnv("GMAIL_EMAIL"),
        password: getEnv("GMAIL_PASSWORD"),
    },
}

