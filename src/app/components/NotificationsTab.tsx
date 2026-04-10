import { useState } from 'react';
import { Bell, Send, Users, UserCheck, Heart, Building2, X, Plus, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Client } from './ClientForm';
import { Caregiver } from './CaregiverForm';
import { Volunteer } from './VolunteerForm';
import { Sponsor } from './SponsorForm';

interface NotificationsTabProps {
  clients: Client[];
  caregivers: Caregiver[];
  volunteers: Volunteer[];
  sponsors: Sponsor[];
}

interface Notification {
  id: string;
  subject: string;
  message: string;
  isUrgent: boolean;
  recipientMode: 'groups' | 'individual';
  recipientGroups: {
    clients: boolean;
    caregivers: boolean;
    volunteers: boolean;
    sponsors: boolean;
  };
  selectedEmails: string[];
  sentAt?: string;
  createdAt: string;
  recipientCount: number;
}

const INITIAL_FORM = {
  subject: '',
  message: '',
  isUrgent: false,
  recipientMode: 'groups' as const,
  recipientGroups: { clients: false, caregivers: false, volunteers: false, sponsors: false },
  selectedEmails: [] as string[],
};

export function NotificationsTab({ clients, caregivers, volunteers, sponsors }: NotificationsTabProps) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const saved = localStorage.getItem('notifications');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [showCompose, setShowCompose] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const saveNotifications = (updated: Notification[]) => {
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  // Build the full recipient email list based on current form state
  const getSelectedEmails = (): string[] => {
    if (form.recipientMode === 'individual') {
      return form.selectedEmails;
    }
    const emails: string[] = [];
    if (form.recipientGroups.clients) emails.push(...clients.map(c => c.email).filter(Boolean));
    if (form.recipientGroups.caregivers) emails.push(...caregivers.map(c => c.email).filter(Boolean));
    if (form.recipientGroups.volunteers) emails.push(...volunteers.map(v => v.email).filter(Boolean));
    if (form.recipientGroups.sponsors) emails.push(...sponsors.map(s => s.email).filter(Boolean));
    return [...new Set(emails)];
  };

  const selectedCount = getSelectedEmails().length;

  // All individual recipient options
  const allRecipients = [
    ...clients.map(c => ({ email: c.email, name: `${c.firstName} ${c.lastName}`, type: 'Client' as const })),
    ...caregivers.map(c => ({ email: c.email, name: `${c.firstName} ${c.lastName}`, type: 'Caregiver' as const })),
    ...volunteers.map(v => ({ email: v.email, name: `${v.firstName} ${v.lastName}`, type: 'Volunteer' as const })),
    ...sponsors.map(s => ({ email: s.email, name: s.name, type: 'Sponsor' as const })),
  ].filter(r => r.email);

  const toggleEmail = (email: string) => {
    setForm(f => ({
      ...f,
      selectedEmails: f.selectedEmails.includes(email)
        ? f.selectedEmails.filter(e => e !== email)
        : [...f.selectedEmails, email],
    }));
  };

  const selectAll = () => setForm(f => ({ ...f, selectedEmails: allRecipients.map(r => r.email) }));
  const clearAll = () => setForm(f => ({ ...f, selectedEmails: [] }));

  const handleSave = () => {
    if (!form.subject.trim() || !form.message.trim()) return;
    const emails = getSelectedEmails();
    if (emails.length === 0) {
      alert('Please select at least one recipient.');
      return;
    }
    const newNotif: Notification = {
      id: Date.now().toString(),
      subject: form.subject.trim(),
      message: form.message.trim(),
      isUrgent: form.isUrgent,
      recipientMode: form.recipientMode,
      recipientGroups: { ...form.recipientGroups },
      selectedEmails: emails,
      createdAt: new Date().toISOString(),
      recipientCount: emails.length,
    };
    saveNotifications([newNotif, ...notifications]);
    setForm(INITIAL_FORM);
    setShowCompose(false);
  };

  const handleSend = (notification: Notification) => {
    setSendingId(notification.id);
    const bcc = notification.selectedEmails.join(',');
    const subject = encodeURIComponent((notification.isUrgent ? '[URGENT] ' : '') + notification.subject);
    const body = encodeURIComponent(notification.message);
    window.open(`mailto:?bcc=${encodeURIComponent(bcc)}&subject=${subject}&body=${body}`, '_blank');
    setTimeout(() => {
      const updated = notifications.map(n =>
        n.id === notification.id ? { ...n, sentAt: new Date().toISOString() } : n
      );
      saveNotifications(updated);
      setSendingId(null);
    }, 800);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this notification?')) return;
    saveNotifications(notifications.filter(n => n.id !== id));
  };

  const typeColor = (type: string) => {
    if (type === 'Client') return 'bg-blue-100 text-blue-700';
    if (type === 'Caregiver') return 'bg-green-100 text-green-700';
    if (type === 'Volunteer') return 'bg-orange-100 text-orange-700';
    return 'bg-pink-100 text-pink-700';
  };

  const groupInfo = [
    { key: 'clients' as const, label: 'Clients', count: clients.length, icon: <Users className="w-4 h-4" /> },
    { key: 'caregivers' as const, label: 'Caregivers', count: caregivers.length, icon: <UserCheck className="w-4 h-4" /> },
    { key: 'volunteers' as const, label: 'Volunteers', count: volunteers.length, icon: <Heart className="w-4 h-4" /> },
    { key: 'sponsors' as const, label: 'Sponsors', count: sponsors.length, icon: <Building2 className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Notifications</h2>
          <p className="text-sm text-gray-500 mt-1">Send urgent alerts and targeted messages to specific recipients</p>
        </div>
        {!showCompose && (
          <Button onClick={() => setShowCompose(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Compose Notification
          </Button>
        )}
      </div>

      {/* Compose form */}
      {showCompose && (
        <Card className="p-6 space-y-5 border-orange-200 bg-orange-50/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-600" />
              <h3 className="font-medium text-gray-800">New Notification</h3>
            </div>
            <button onClick={() => { setShowCompose(false); setForm(INITIAL_FORM); }} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Urgent toggle */}
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <input
              type="checkbox"
              id="urgent"
              checked={form.isUrgent}
              onChange={e => setForm(f => ({ ...f, isUrgent: e.target.checked }))}
              className="w-4 h-4 accent-red-600"
            />
            <label htmlFor="urgent" className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Mark as Urgent — prefix subject with [URGENT]
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              placeholder="Notification subject…"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Write your notification message here…"
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y"
            />
          </div>

          {/* Recipient mode toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Selection Mode</label>
            <div className="flex gap-3">
              <button
                onClick={() => setForm(f => ({ ...f, recipientMode: 'groups' }))}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium border transition-all ${
                  form.recipientMode === 'groups'
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-orange-300'
                }`}
              >
                By Group
              </button>
              <button
                onClick={() => setForm(f => ({ ...f, recipientMode: 'individual' }))}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium border transition-all ${
                  form.recipientMode === 'individual'
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-orange-300'
                }`}
              >
                Individual Recipients
              </button>
            </div>
          </div>

          {/* Group selection */}
          {form.recipientMode === 'groups' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Select Groups</label>
              <div className="flex flex-wrap gap-3">
                {groupInfo.map(({ key, label, count, icon }) => (
                  <button
                    key={key}
                    onClick={() => setForm(f => ({
                      ...f,
                      recipientGroups: { ...f.recipientGroups, [key]: !f.recipientGroups[key] }
                    }))}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      form.recipientGroups[key]
                        ? 'bg-orange-100 text-orange-700 border-orange-400'
                        : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {icon}
                    {label} ({count})
                    {form.recipientGroups[key] && <span className="text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Individual selection */}
          {form.recipientMode === 'individual' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Select Individual Recipients ({form.selectedEmails.length} selected)
                </label>
                <div className="flex gap-2">
                  <button onClick={selectAll} className="text-xs text-orange-600 hover:underline">Select All</button>
                  <span className="text-gray-300">|</span>
                  <button onClick={clearAll} className="text-xs text-gray-500 hover:underline">Clear</button>
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md divide-y">
                {allRecipients.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500 text-center">No recipients with email addresses found.</p>
                ) : (
                  allRecipients.map(r => (
                    <label key={r.email} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.selectedEmails.includes(r.email)}
                        onChange={() => toggleEmail(r.email)}
                        className="w-4 h-4 accent-orange-600"
                      />
                      <span className="flex-1 text-sm">{r.name}</span>
                      <Badge variant="outline" className={`text-xs ${typeColor(r.type)}`}>{r.type}</Badge>
                      <span className="text-xs text-gray-400">{r.email}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-gray-500">
              {selectedCount} recipient{selectedCount !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setShowCompose(false); setForm(INITIAL_FORM); }}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!form.subject.trim() || !form.message.trim() || selectedCount === 0}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Save Notification
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Notification list */}
      {notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No notifications yet. Compose your first notification above.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <Card key={n.id} className={`p-5 ${n.sentAt ? 'border-green-300 bg-green-50/30' : n.isUrgent ? 'border-red-200 bg-red-50/20' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {n.isUrgent && (
                      <Badge className="bg-red-100 text-red-700 border-red-300">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        URGENT
                      </Badge>
                    )}
                    <h3 className="font-semibold text-base">{n.subject}</h3>
                    {n.sentAt && (
                      <Badge variant="outline" className="border-green-400 text-green-700 bg-green-50">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Sent
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2 whitespace-pre-line">{n.message}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                    <span>{n.recipientCount} recipient{n.recipientCount !== 1 ? 's' : ''}</span>
                    <span>Created {new Date(n.createdAt).toLocaleString()}</span>
                    {n.sentAt && <span>Sent {new Date(n.sentAt).toLocaleString()}</span>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => handleSend(n)}
                    disabled={sendingId === n.id}
                    className={n.isUrgent ? 'bg-red-600 hover:bg-red-700' : ''}
                  >
                    <Send className="w-3 h-3 mr-1" />
                    {sendingId === n.id ? 'Opening…' : n.sentAt ? 'Resend' : 'Send'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(n.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
