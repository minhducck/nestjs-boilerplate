export type QueueMessageType<T = any> = {
  topicId: string;
  data: T;
};
