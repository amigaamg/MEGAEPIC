'use client';
import { useState, useMemo } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Wifi, Radio, Tv, Volume2, Lightbulb, Send, CheckCircle, XCircle, AlertTriangle, Settings, RefreshCw, TestTube, Shield } from 'lucide-react';
import { ChannelType, NotificationSeverity, NotificationCategory, createNotification, deliverNotificationViaChannel, getNotificationSummary, type Notification, type NotificationRecipient } from '@/lib/amexan/hmis/notification-engine';
import { getDeliveryConfig, getDeliveryConfigSummary, getDeliveryStats, updateDeliveryConfig, type DeliveryConfig, type DeliveryResult } from '@/lib/amexan/hmis/notification-delivery';

const CHANNEL_INFO: Record<ChannelType, { label: string; icon: any; color: string; description: string }> = {
  [ChannelType.InApp]: { label: 'In-App', icon: Bell, color: '#3B82F6', description: 'Push notifications within the application' },
  [ChannelType.Email]: { label: 'Email', icon: Mail, color: '#10B981', description: 'Email delivery via SendGrid/SES/SMTP' },
  [ChannelType.SMS]: { label: 'SMS', icon: MessageSquare, color: '#F59E0B', description: 'Text message delivery via Twilio/SNS' },
  [ChannelType.Push]: { label: 'Push', icon: Smartphone, color: '#8B5CF6', description: 'Mobile push notifications via FCM/APNS' },
  [ChannelType.WhatsApp]: { label: 'WhatsApp', icon: MessageSquare, color: '#25D366', description: 'WhatsApp Business API messages' },
  [ChannelType.Pager]: { label: 'Pager', icon: Radio, color: '#EF4444', description: 'Pager/alert system for critical events' },
  [ChannelType.Dashboard]: { label: 'Dashboard', icon: Tv, color: '#06B6D4', description: 'In-app dashboard alerts' },
  [ChannelType.SoundAlarm]: { label: 'Sound Alarm', icon: Volume2, color: '#EF4444', description: 'Audible alarm for critical events' },
  [ChannelType.LightAlarm]: { label: 'Light Alarm', icon: Lightbulb, color: '#F59E0B', description: 'Visual light alarm for critical events' },
  [ChannelType.Broadcast]: { label: 'Broadcast', icon: Send, color: '#64748B', description: 'Broadcast to all users' },
};

const MOCK_RECIPIENTS: NotificationRecipient[] = [
  { userId: 'ACT-001', role: 'clinician', email: 'doctor@hospital.com', phone: '+254700100200', deviceToken: 'fcm_token_001' },
  { userId: 'ACT-002', role: 'nurse', email: 'nurse@hospital.com', phone: '+254700100201', deviceToken: 'fcm_token_002' },
  { userId: 'ACT-003', role: 'admin', email: 'admin@hospital.com', phone: '+254700100202', deviceToken: 'fcm_token_003' },
];

export default function NotificationsDeliveryPage() {
  const [activeTab, setActiveTab] = useState<'channels' | 'config' | 'test' | 'logs'>('channels');
  const [deliveryConfig, setDeliveryConfig] = useState<DeliveryConfig>(getDeliveryConfig());
  const [testResults, setTestResults] = useState<DeliveryResult[]>([]);
  const [sending, setSending] = useState(false);

  const configSummary = useMemo(() => getDeliveryConfigSummary(), []);

  const handleTestDelivery = async () => {
    setSending(true);
    const testNotification = createNotification({
      type: 'general' as any,
      category: NotificationCategory.System,
      severity: NotificationSeverity.Informational,
      title: 'Test Notification',
      body: 'This is a test delivery from AMEXAN notification system',
      source: { type: 'system', userId: 'admin' },
      sourceId: 'test',
      recipients: MOCK_RECIPIENTS,
      channels: [
        { type: ChannelType.Email, status: 'pending' },
        { type: ChannelType.SMS, status: 'pending' },
        { type: ChannelType.Push, status: 'pending' },
        { type: ChannelType.InApp, status: 'pending' },
      ],
    });

    const results = await getDeliveryStats([
      await deliverNotificationViaChannel(testNotification, ChannelType.Email, MOCK_RECIPIENTS[0]),
      await deliverNotificationViaChannel(testNotification, ChannelType.SMS, MOCK_RECIPIENTS[0]),
      await deliverNotificationViaChannel(testNotification, ChannelType.Push, MOCK_RECIPIENTS[0]),
      await deliverNotificationViaChannel(testNotification, ChannelType.InApp, MOCK_RECIPIENTS[0]),
    ]);

    setTestResults([
      await deliverNotificationViaChannel(testNotification, ChannelType.Email, MOCK_RECIPIENTS[0]),
      await deliverNotificationViaChannel(testNotification, ChannelType.SMS, MOCK_RECIPIENTS[0]),
      await deliverNotificationViaChannel(testNotification, ChannelType.Push, MOCK_RECIPIENTS[0]),
      await deliverNotificationViaChannel(testNotification, ChannelType.InApp, MOCK_RECIPIENTS[0]),
    ]);
    setSending(false);
  };

  const updateConfig = (channel: keyof DeliveryConfig, updates: Record<string, string>) => {
    const newConfig = { ...deliveryConfig, [channel]: { ...(deliveryConfig[channel] as any), ...updates } };
    setDeliveryConfig(newConfig);
    updateDeliveryConfig(newConfig);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Notification Delivery</h1>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>Configure and monitor email, SMS, WhatsApp, push, and pager delivery channels</p>
        </div>
        <button onClick={handleTestDelivery} disabled={sending}
          style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: sending ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#06B6D4,#0891B2)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: sending ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
          <TestTube size={14} /> {sending ? 'Sending...' : 'Test Delivery'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Channels', value: 10, color: '#06B6D4', icon: <Bell size={14} /> },
          { label: 'Configured', value: Object.values(configSummary).filter(v => v !== 'not configured').length, color: '#10B981', icon: <CheckCircle size={14} /> },
          { label: 'Not Configured', value: Object.values(configSummary).filter(v => v === 'not configured').length, color: '#F59E0B', icon: <AlertTriangle size={14} /> },
          { label: 'Test Results', value: testResults.length, color: '#8B5CF6', icon: <Send size={14} /> },
        ].map(stat => (
          <div key={stat.label} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2" style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>{stat.icon} {stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: "'Syne',sans-serif" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-1" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 4 }}>
        {(['channels', 'config', 'test', 'logs'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: 'none', background: activeTab === tab ? 'rgba(6,182,212,0.15)' : 'transparent', color: activeTab === tab ? '#06B6D4' : '#64748B', fontSize: 12, fontWeight: activeTab === tab ? 600 : 400, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", textTransform: 'capitalize' }}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'channels' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {Object.entries(CHANNEL_INFO).map(([type, info]) => {
            const Icon = info.icon;
            const isConfigured = configSummary[type as keyof typeof configSummary] !== 'not configured';
            return (
              <div key={type} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', padding: 16 }}>
                <div className="flex items-center gap-3" style={{ marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `${info.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: info.color }}><Icon size={18} /></div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>{info.label}</div>
                    <div style={{ fontSize: 10, color: '#64748B' }}>{isConfigured ? 'Configured' : 'Not configured'}</div>
                  </div>
                </div>
                <p style={{ fontSize: 11, color: '#64748B', lineHeight: 1.5, marginBottom: 10 }}>{info.description}</p>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {Object.entries(configSummary).filter(([k]) => k === type.toLowerCase() || (type === ChannelType.Email && k === 'email') || (type === ChannelType.SMS && k === 'sms') || (type === ChannelType.Push && k === 'push')).map(([k, v]) => (
                    <span key={k} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: v === 'not configured' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', color: v === 'not configured' ? '#EF4444' : '#10B981' }}>{v === 'not configured' ? 'Missing' : 'OK'}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'config' && (
        <div className="flex flex-col gap-4">
          <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', marginBottom: 4 }}>Delivery Configuration</div>
          {[
            { key: 'email', label: 'Email (SendGrid/SES/SMTP)', fields: ['provider', 'apiKey', 'senderEmail', 'senderName'] },
            { key: 'sms', label: 'SMS (Twilio/SNS/Africa\'s Talking)', fields: ['provider', 'accountSid', 'authToken', 'fromNumber'] },
            { key: 'whatsapp', label: 'WhatsApp (Twilio/Meta Business)', fields: ['provider', 'accountSid', 'authToken', 'fromNumber'] },
            { key: 'push', label: 'Push Notifications (FCM/APNS)', fields: ['provider', 'serverKey', 'senderId'] },
            { key: 'pager', label: 'Pager System (Spok/Atos)', fields: ['provider', 'apiKey'] },
          ].map(section => (
            <div key={section.key} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#F1F5F9', marginBottom: 12 }}>{section.label}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                {section.fields.map(field => (
                  <div key={field}>
                    <label style={{ fontSize: 10, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>{field}</label>
                    <input
                      type={field === 'apiKey' || field === 'authToken' || field === 'serverKey' ? 'password' : 'text'}
                      placeholder={`Enter ${field}...`}
                      value={(deliveryConfig[section.key as keyof DeliveryConfig] as any)?.[field] || ''}
                      onChange={e => updateConfig(section.key as keyof DeliveryConfig, { [field]: e.target.value })}
                      style={{ width: '100%', height: 34, padding: '0 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', fontSize: 12, outline: 'none', fontFamily: "'DM Sans',sans-serif" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'test' && (
        <div className="flex flex-col gap-4">
          <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', marginBottom: 4 }}>Delivery Test Results</div>
          {testResults.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#64748B', fontSize: 12 }}>Click "Test Delivery" to send test notifications across all configured channels</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {testResults.map((result, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>{result.channel}</span>
                    <span style={{ fontSize: 10, color: '#64748B' }}>{result.recipient}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.status === 'sent' ? (
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>Sent</span>
                    ) : (
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>Failed</span>
                    )}
                    {result.error && <span style={{ fontSize: 10, color: '#64748B' }}>{result.error}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="flex flex-col gap-4">
          <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', marginBottom: 4 }}>Delivery Logs</div>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', padding: 16, fontFamily: 'monospace', fontSize: 11, color: '#94A3B8', maxHeight: 400, overflow: 'auto' }}>
            {testResults.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20 }}>No delivery logs yet. Run a test delivery to see logs.</div>
            ) : (
              testResults.map((r, i) => (
                <div key={i} style={{ marginBottom: 6, padding: 6, borderRadius: 4, background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ color: r.status === 'sent' ? '#10B981' : '#EF4444' }}>[{new Date().toISOString()}] {r.channel} → {r.recipient}: {r.status}</div>
                  {r.messageId && <div style={{ color: '#64748B', marginLeft: 8 }}>Message ID: {r.messageId}</div>}
                  {r.error && <div style={{ color: '#EF4444', marginLeft: 8 }}>Error: {r.error}</div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}