import { useState } from 'react';
import { Mail, Send, Users, UserCheck, Heart, Building2, X, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Client } from './ClientForm';
import { Caregiver } from './CaregiverForm';
import { Volunteer } from './VolunteerForm';
import { Sponsor } from './SponsorForm';

interface NewsletterTabProps {
  clients: Client[];
  caregivers: Caregiver[];
  volunteers: Volunteer[];
  sponsors: Sponsor[];
}

interface Newsletter {
  id: string;
  subject: string;
  body: string;
  createdAt: string;
}

const INITIAL_FORM = { subject: '', body: '' };

export function NewsletterTab({ clients, caregivers, volunteers, sponsors }: NewsletterTabProps) {
  const [newsletters, setNewsletters] = useState<Newsletter[]>(() => {
    try {
      const saved = localStorage.getItem('newsletters');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [showCompose, setShowCompose] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [recipientGroups, setRecipientGroups] = useState({
    clients: true,
    caregivers: false,
    volunteers: false,
    sponsors: false,
  });
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  const saveNewsletters = (updated: Newsletter[]) => {
    setNewsletters(updated);
    localStorage.setItem('newsletters', JSON.stringify(updated));
  };

  const handleSave = () => {
    if (!form.subject.trim() || !form.body.trim()) return;
    const newNl: Newsletter = {
      id: Date.now().toString(),
      subject: form.subject.trim(),
      body: form.body.trim(),
      createdAt: new Date().toISOString(),
    };
    saveNewsletters([newNl, ...newsletters]);
    setForm(INITIAL_FORM);
    setShowCompose(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this newsletter draft?')) return;
    saveNewsletters(newsletters.filter(n => n.id !== id));
  };

  const getRecipientEmails = () => {
    const emails: string[] = [];
    if (recipientGroups.clients) emails.push(...clients.map(c => c.email).filter(Boolean));
    if (recipientGroups.caregivers) emails.push(...caregivers.map(c => c.email).filter(Boolean));
    if (recipientGroups.volunteers) emails.push(...volunteers.map(v => v.email).filter(Boolean));
    if (recipientGroups.sponsors) emails.push(...sponsors.map(s => s.email).filter(Boolean));
    return [...new Set(emails)];
  };

  const recipientCount = getRecipientEmails().length;

  const handleSend = (newsletter: Newsletter) => {
    const emails = getRecipientEmails();
    if (emails.length === 0) {
      alert('Please select at least one recipient group with valid email addresses.');
      return;
    }
    setSendingId(newsletter.id);
    // Open default email client with newsletter content (BCC all recipients)
    const bcc = emails.join(',');
    const subject = encodeURIComponent(newsletter.subject);
    const body = encodeURIComponent(newsletter.body);
    const mailtoLink = `mailto:?bcc=${encodeURIComponent(bcc)}&subject=${subject}&body=${body}`;
    window.open(mailtoLink, '_blank');

    // Mark as sent after a short delay
    setTimeout(() => {
      setSentIds(prev => new Set(prev).add(newsletter.id));
      setSendingId(null);
    }, 800);
  };

  const toggleGroup = (group: keyof typeof recipientGroups) => {
    setRecipientGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const groupInfo = [
    { key: 'clients' as const, label: 'Clients', count: clients.length, icon: <Users className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700' },
    { key: 'caregivers' as const, label: 'Caregivers', count: caregivers.length, icon: <UserCheck className="w-4 h-4" />, color: 'bg-green-100 text-green-700' },
    { key: 'volunteers' as const, label: 'Volunteers', count: volunteers.length, icon: <Heart className="w-4 h-4" />, color: 'bg-orange-100 text-orange-700' },
    { key: 'sponsors' as const, label: 'Sponsors', count: sponsors.length, icon: <Building2 className="w-4 h-4" />, color: 'bg-pink-100 text-pink-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Newsletter Management</h2>
        {!showCompose && (
          <Button onClick={() => setShowCompose(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Compose Newsletter
          </Button>
        )}
      </div>

      {/* Compose form */}
      {showCompose && (
        <Card className="p-6 space-y-4 border-blue-200 bg-blue-50/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-gray-800">New Newsletter</h3>
            </div>
            <button onClick={() => { setShowCompose(false); setForm(INITIAL_FORM); }} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              placeholder="Newsletter subject…"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
            <textarea
              value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              placeholder="Write your newsletter content here…"
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => { setShowCompose(false); setForm(INITIAL_FORM); }}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!form.subject.trim() || !form.body.trim()}>
              Save Newsletter
            </Button>
          </div>
        </Card>
      )}

      {/* Recipients panel */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Send className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700">Recipient Groups</h3>
          <span className="ml-auto text-sm text-gray-500">
            {recipientCount} recipient{recipientCount !== 1 ? 's' : ''} selected
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          {groupInfo.map(({ key, label, count, icon, color }) => (
            <button
              key={key}
              onClick={() => toggleGroup(key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                recipientGroups[key]
                  ? `${color} border-current`
                  : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300'
              }`}
            >
              {icon}
              {label}
              <span className="text-xs ml-1">({count})</span>
              {recipientGroups[key] && <span className="ml-1 text-xs">✓</span>}
            </button>
          ))}
        </div>
      </Card>

      {/* Newsletter list */}
      {newsletters.length === 0 ? (
        <Card className="p-12 text-center">
          <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No newsletters yet. Compose your first newsletter above.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {newsletters.map(nl => {
            const isSent = sentIds.has(nl.id);
            const isSending = sendingId === nl.id;
            return (
              <Card key={nl.id} className={`p-5 ${isSent ? 'border-green-300 bg-green-50/30' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-base truncate">{nl.subject}</h3>
                      {isSent && (
                        <Badge variant="outline" className="border-green-400 text-green-700 bg-green-50">
                          Sent
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2 whitespace-pre-line">{nl.body}</p>
                    <p className="mt-2 text-xs text-gray-400">
                      Created {new Date(nl.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleSend(nl)}
                      disabled={isSending || recipientCount === 0}
                      className="flex items-center gap-2"
                    >
                      <Send className="w-3 h-3" />
                      {isSending ? 'Opening…' : isSent ? 'Send Again' : 'Send'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(nl.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
