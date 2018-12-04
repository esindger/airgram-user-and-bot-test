const promiseFinally = require('promise.prototype.finally');
promiseFinally.shim();
import 'reflect-metadata';
import {Airgram, ag, AuthDialog, TYPES, api} from "airgram";
import JSONBotStore from "./bot.store";
import JSONUserStore from "./user.store";
import {prompt} from "airgram/helpers";
import { AppBotConfigType, AppUserConfigType } from './config';

export function createApp(config: AppBotConfigType | AppUserConfigType): Airgram {
  let airgram: Airgram;
  if ('bot_token' in config) {
    airgram = new Airgram({ id: config.api_id, hash: config.api_hash, token: config.bot_token });
    airgram.bind<JSONBotStore<ag.AuthDoc>>(TYPES.AuthStore).to(JSONBotStore);
    airgram.bind<JSONBotStore<ag.MtpState>>(TYPES.MtpStateStore).to(JSONBotStore);
  } else {
    airgram = new Airgram({ id: config.api_id, hash: config.api_hash });
    airgram.bind<JSONUserStore<ag.AuthDoc>>(TYPES.AuthStore).to(JSONUserStore);
    airgram.bind<JSONUserStore<ag.MtpState>>(TYPES.MtpStateStore).to(JSONUserStore);
  }

  const { auth } = airgram;

  airgram.use(auth);

  auth.use(new AuthDialog({
    firstName: '',
    lastName: '',
    phoneNumber: config.phone_number,
    code: () => prompt('Please input the secret code:'),
    samePhoneNumber: ({ phoneNumber }) => prompt(`Do you want to sign in with the "${phoneNumber}" phone number? Y/N`),
    continue: ({ phoneNumber }) => prompt(`Do you have the secret code for the "${phoneNumber}" and wish to continue? Y/N`)
  }));

  return airgram
}

export default createApp

export function authorizeApp(airgram: Airgram, config: AppBotConfigType | AppUserConfigType) {
  airgram.auth.use(new AuthDialog({
    firstName: '',
    lastName: '',
    phoneNumber: config.phone_number,
    code: () => prompt('Please input the secret code:'),
    samePhoneNumber: ({ phoneNumber }) => prompt(`Do you want to sign in with the "${phoneNumber}" phone number? Y/N`),
    continue: ({ phoneNumber }) => prompt(`Do you have the secret code for the "${phoneNumber}" and wish to continue? Y/N`)
  }));

  return airgram.auth.login()
}

export function sendChatMessage(airgram: Airgram, chat_id: number, text: string): Promise<any> {
  return airgram.client.messages.sendMessage({
    peer: { _: 'inputPeerChat', chat_id: chat_id },
    message: text,
    random_id: Date.now(),
  })
}

export function getLastChatMessage(airgram: Airgram, chat_id: number): Promise<any> {
  return airgram.client.messages.getHistory({
    peer: { _: 'inputPeerChat', chat_id: chat_id },
    add_offset: 0,
    limit: 1,
    max_id: 0,
    min_id: 0,
    offset_date: 0,
    offset_id: 0,
  }).then(data => data.messages[0])
}

export function getDifference(airgram: Airgram) {
  return airgram.updates.getDifference().then((difference: api.UpdatesDifferenceUnion) => {
    console.log('difference:', difference)
  })
}