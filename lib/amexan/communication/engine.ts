export type CommunicationChannel = 'direct' | 'care_team' | 'organization' | 'announcement' | 'patient';
export type MessagePriority = 'routine' | 'important' | 'urgent' | 'critical';
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'archived';

export interface MessageSender {
  uid: string;
  name: string;
  role?: string;
  departmentId?: string;
  departmentName?: string;
}

export interface CommunicationMessage {
  id: string;
  channel: CommunicationChannel;
  threadId: string;
  sender: MessageSender;
  body: string;
  priority: MessagePriority;
  status: MessageStatus;
  organizationId: string;
  patientId?: string;
  encounterId?: string;
  mentions?: string[];
  attachments?: { name: string; type: string; url: string }[];
  createdAt: number;
  readBy: string[];
  parentId?: string;
}

export interface CommunicationThread {
  id: string;
  channel: CommunicationChannel;
  title: string;
  description?: string;
  organizationId: string;
  participants: MessageSender[];
  patientId?: string;
  encounterId?: string;
  createdAt: number;
  updatedAt: number;
  lastMessage?: Pick<CommunicationMessage, 'body' | 'createdAt' | 'sender'>;
  unreadCount: number;
  pinned?: boolean;
  tags?: string[];
}

const threads = new Map<string, CommunicationThread>();
const messages = new Map<string, CommunicationMessage>();

export function createThread(input: Omit<CommunicationThread, 'id' | 'createdAt' | 'updatedAt' | 'unreadCount'>): CommunicationThread {
  const now = Date.now();
  const thread: CommunicationThread = {
    ...input,
    id: `thread_${now}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    updatedAt: now,
    unreadCount: 0,
  };
  threads.set(thread.id, thread);
  return thread;
}

export function sendMessage(input: Omit<CommunicationMessage, 'id' | 'status' | 'readBy' | 'createdAt'>): CommunicationMessage {
  const now = Date.now();
  const message: CommunicationMessage = {
    ...input,
    id: `msg_${now}_${Math.random().toString(36).slice(2, 8)}`,
    status: 'sent',
    readBy: [],
    createdAt: now,
  };
  messages.set(message.id, message);

  const thread = threads.get(input.threadId);
  if (thread) {
    thread.updatedAt = now;
    thread.lastMessage = { body: message.body, createdAt: now, sender: message.sender };
    thread.unreadCount += thread.participants.some(p => p.uid !== message.sender.uid) ? 1 : 0;
  }
  return message;
}

export function markRead(threadId: string, uid: string): void {
  const thread = threads.get(threadId);
  if (!thread) return;
  thread.unreadCount = 0;
  messages.forEach(m => {
    if (m.threadId === threadId && !m.readBy.includes(uid)) {
      m.readBy.push(uid);
      if (m.readBy.length >= thread.participants.length - 1) m.status = 'read';
    }
  });
}

export function getThreads(organizationId: string, options?: { channel?: CommunicationChannel; uid?: string; patientId?: string }): CommunicationThread[] {
  return Array.from(threads.values())
    .filter(t => t.organizationId === organizationId)
    .filter(t => !options?.channel || t.channel === options.channel)
    .filter(t => !options?.patientId || t.patientId === options.patientId)
    .filter(t => !options?.uid || t.participants.some(p => p.uid === options.uid))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getMessages(threadId: string, limit = 200): CommunicationMessage[] {
  return Array.from(messages.values())
    .filter(m => m.threadId === threadId)
    .sort((a, b) => a.createdAt - b.createdAt)
    .slice(-limit);
}

export function getUnreadCount(organizationId: string, uid: string): number {
  return Array.from(threads.values())
    .filter(t => t.organizationId === organizationId && t.participants.some(p => p.uid === uid))
    .reduce((sum, t) => sum + t.unreadCount, 0);
}

export function createCareTeamThread(input: {
  organizationId: string;
  title: string;
  description?: string;
  participants: MessageSender[];
  patientId?: string;
  encounterId?: string;
}): CommunicationThread {
  return createThread({ ...input, channel: 'care_team', tags: ['care_team'] });
}

export function createPatientThread(input: {
  organizationId: string;
  patientId: string;
  patientName: string;
  participants: MessageSender[];
}): CommunicationThread {
  return createThread({
    organizationId: input.organizationId,
    channel: 'patient',
    title: `Patient — ${input.patientName}`,
    patientId: input.patientId,
    participants: input.participants,
    tags: ['patient'],
  });
}

export function createAnnouncement(input: {
  organizationId: string;
  title: string;
  description?: string;
  sender: MessageSender;
  priority?: MessagePriority;
}): CommunicationThread {
  const thread = createThread({
    organizationId: input.organizationId,
    channel: 'announcement',
    title: input.title,
    description: input.description,
    participants: [input.sender],
    tags: ['announcement'],
  });
  sendMessage({
    threadId: thread.id,
    channel: 'announcement',
    sender: input.sender,
    body: input.description || input.title,
    priority: input.priority || 'routine',
    organizationId: input.organizationId,
  });
  return thread;
}

export function resetCommunicationStore(): void {
  threads.clear();
  messages.clear();
}

export function getThreadStats(): { threads: number; messages: number } {
  return { threads: threads.size, messages: messages.size };
}
