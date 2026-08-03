export {
  createThread,
  sendMessage,
  markRead,
  getThreads,
  getMessages,
  getUnreadCount,
  createCareTeamThread,
  createPatientThread,
  createAnnouncement,
  resetCommunicationStore,
  getThreadStats,
} from './engine';
export type {
  CommunicationChannel,
  MessagePriority,
  MessageStatus,
  MessageSender,
  CommunicationMessage,
  CommunicationThread,
} from './engine';
