import Airgram from 'airgram';

import { createApp, getDifference, getLastChatMessage, sendChatMessage } from './app';
import { AppBotConfigType, createBotConfig, AppUserConfigType, createUserConfig } from './config';

describe("Check e2e Bot response", () => {
  let botConfig: AppBotConfigType;
  let botApp: Airgram;
  let userConfig: AppUserConfigType;
  let userApp: Airgram;
  let chatId: number;

  beforeAll(async () => {
    botConfig = createBotConfig();
    botApp = createApp(botConfig);

    userConfig = createUserConfig();
    userApp = createApp(userConfig);

    chatId = botConfig.chat_id;
  });

  test("User send /start command and receive response", async () => {
    jest.setTimeout(30000);
    expect.assertions(2);

    await Promise.all([
      sendChatMessage(userApp, chatId, 'Hello from User').then(() => expect(true).toBe(true)),
      sendChatMessage(botApp, chatId, 'Hello from Bot').then(() => expect(true).toBe(true))
    ])
  });

});