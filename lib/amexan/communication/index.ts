// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Hospital Communication Engine — Engine IV — Public surface
// The official hospital communication authority: announcements, circulars,
// policies, meetings, emergency broadcasts, committees, internal messaging,
// acknowledgements, templates, analytics + Red Mode.
// ═══════════════════════════════════════════════════════════════════════════════

export { CommunicationEngine, genCommsId, isAnnouncement, isCircular, isEmergency, isPolicy } from './CommunicationEngine';
export * from './registry';
export * from './constitutional-types';
export type { CommunicationRepository } from './repository';
export { FirestoreCommunicationRepository, loadCommunicationModel, saveCommunicationModel } from './FirestoreCommunicationRepository';
// Legacy low-level messaging engine (threads / participants) remains available.
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