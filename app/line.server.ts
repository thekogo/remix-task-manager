import { Client, ClientConfig } from '@line/bot-sdk';

export enum ActionType {
  Acknowledge = "acknowledge",
  Complete = "complete",
  UnfinishedTask = "unfinishedTask"
}

export type PostbackData = {
  action: ActionType,
  taskId?: number,
}

const clientConfig: ClientConfig = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.CHANNEL_SECRET
};

const client = new Client(clientConfig);

export default client;
