import { useState } from 'react';
import { Globe, Phone, Mail, MapPin, Calendar, Edit2, Save, X, Plus, Trash2, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { SubmissionsTab } from './SubmissionsTab';

export interface PublicContent {
  headline: string;
  tagline: string;
  description: string;
  services: string[];
  contactEmail: string;
  contactPhone: string;
  address: string;
  updatedAt: string;
}

const DEFAULT_CONTENT: PublicContent = {
  headline: 'Whispering Hills Special Population Resource Connection',
  tagline: 'Connecting families with the resources they need',
  description: 'We provide a comprehensive database of opportunities, events, and services for individuals with special needs and their families. Our mission is to ensure that every person has access to the resources and community support they deserve.',
  services: [
    'Community Events & Activities',
    'Volunteer Programs',
    'Caregiver Support Services',
    'Educational Workshops',
    'Social Opportunities',
    'Resource Referrals',
  ],
  contactEmail: 'info@whisperinghills.org',
  contactPhone: '(555) 000-0000',
  address: 'Whispering Hills Community Center',
  updatedAt: new Date().toISOString(),
};

interface PublicPageProps {
  isAdmin?: boolean;
  opportunities?: Array<{ id: string; title: string; type: string; description: string; date: string; time: string; location: string; capacity: number; registered: number; expiresAt: string }>;
}

export function PublicPage({ isAdmin = false, opportunities = [] }: PublicPageProps) {
  const [content, setContent] = useState<PublicContent>(() => {
    try {
      const saved = localStorage.getItem('publicContent');
      return saved ? JSON.parse(saved) : DEFAULT_CONTENT;
    } catch { return DEFAULT_CONTENT; }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<PublicContent>(content);
  const [newService, setNewService] = useState('');
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'resources' | 'events' | 'submit'>('resources');

  const saveContent = (updated: PublicContent) => {
    const withDate = { ...updated, updatedAt: new Date().toISOString() };
    setContent(withDate);
    localStorage.setItem('publicContent', JSON.stringify(withDate));
  };

  const handleSave = () => {
    saveContent(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm(content);
    setIsEditing(false);
  };

  const addService = () => {
    if (newService.trim()) {
      setEditForm(f => ({ ...f, services: [...f.services, newService.trim()] }));
      setNewService('');
    }
  };

  const removeService = (idx: number) => {
    setEditForm(f => ({ ...f, services: f.services.filter((_, i) => i !== idx) }));
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();
  const activeOpps = opportunities.filter(o => !isExpired(o.expiresAt));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white">
        <div className="max-w-4xl mx-auto px-4 py-16">
          {isAdmin && (
            <div className="mb-6 flex justify-end">
              {!isEditing ? (
                <Button
                  variant="outline"
                  onClick={() => { setEditForm(content); setIsEditing(true); }}
                  className="border-white/50 text-white hover:bg-white/10 flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Public Content
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancel} className="border-white/50 text-white hover:bg-white/10 flex items-center gap-2">
                    <X className="w-4 h-4" />Cancel
                  </Button>
                  <Button onClick={handleSave} className="bg-white text-blue-700 hover:bg-gray-100 flex items-center gap-2">
                    <Save className="w-4 h-4" />Save
                  </Button>
                </div>
              )}
            </div>
          )}

          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editForm.headline}
                onChange={e => setEditForm(f => ({ ...f, headline: e.target.value }))}
                className="w-full text-2xl font-bold bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/60 focus:outline-none"
                placeholder="Headline"
              />
              <input
                type="text"
                value={editForm.tagline}
                onChange={e => setEditForm(f => ({ ...f, tagline: e.target.value }))}
                className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/60 focus:outline-none"
                placeholder="Tagline"
              />
              <textarea
                value={editForm.description}
                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                rows={4}
                className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/60 focus:outline-none resize-none"
                placeholder="Description"
              />
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Globe className="w-8 h-8 text-blue-300" />
                <Badge className="bg-blue-500/50 text-blue-100 border-blue-400">Public Resource Portal</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{content.headline}</h1>
              <p className="text-xl text-blue-200 mb-6">{content.tagline}</p>
              <p className="text-blue-100 max-w-2xl leading-relaxed">{content.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Contact bar */}
      <div className="bg-blue-800 text-blue-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex flex-wrap items-center gap-6 text-sm">
          {isEditing ? (
            <div className="flex flex-wrap gap-4 w-full">
              <input type="email" value={editForm.contactEmail} onChange={e => setEditForm(f => ({ ...f, contactEmail: e.target.value }))} placeholder="Email" className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm focus:outline-none" />
              <input type="tel" value={editForm.contactPhone} onChange={e => setEditForm(f => ({ ...f, contactPhone: e.target.value }))} placeholder="Phone" className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm focus:outline-none" />
              <input type="text" value={editForm.address} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} placeholder="Address" className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm focus:outline-none flex-1" />
            </div>
          ) : (
            <>
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" />{content.contactEmail}</span>
              <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" />{content.contactPhone}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{content.address}</span>
            </>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
        {/* Services we offer */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Services We Offer</h2>
          {isEditing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {editForm.services.map((service, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white border rounded-lg p-3">
                    <input
                      type="text"
                      value={service}
                      onChange={e => setEditForm(f => ({ ...f, services: f.services.map((s, i) => i === idx ? e.target.value : s) }))}
                      className="flex-1 text-sm focus:outline-none"
                    />
                    <button onClick={() => removeService(idx)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newService}
                  onChange={e => setNewService(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addService()}
                  placeholder="Add a service…"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button onClick={addService} variant="outline" size="sm"><Plus className="w-4 h-4" /></Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.services.map((service, idx) => (
                <Card key={idx} className="p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
                  <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                  <span className="text-gray-700">{service}</span>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Navigation tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-1">
            {([
              { key: 'resources', label: 'Available Resources' },
              { key: 'events', label: `Upcoming Events (${activeOpps.length})` },
              { key: 'submit', label: 'Submit an Opportunity' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'resources' && (
          <div className="space-y-4">
            <p className="text-gray-600">Browse our available resources and community programs. Contact us to learn more about any service.</p>
            <Card className="p-6 text-center">
              <Globe className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Visit our community center or contact us for a full listing of available resources and programs.</p>
              <div className="mt-4 flex justify-center gap-4">
                <a href={`mailto:${content.contactEmail}`} className="flex items-center gap-2 text-blue-600 hover:underline text-sm">
                  <Mail className="w-4 h-4" /> Email Us
                </a>
                <a href={`tel:${content.contactPhone}`} className="flex items-center gap-2 text-blue-600 hover:underline text-sm">
                  <Phone className="w-4 h-4" /> Call Us
                </a>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-4">
            {activeOpps.length === 0 ? (
              <Card className="p-10 text-center">
                <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No upcoming events at this time. Check back soon!</p>
              </Card>
            ) : (
              activeOpps.map(opp => (
                <Card key={opp.id} className="p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-800">{opp.title}</h3>
                        <Badge variant="outline" className="text-xs capitalize">{opp.type}</Badge>
                        {opp.registered >= opp.capacity && (
                          <Badge className="bg-red-100 text-red-700 text-xs">Full</Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{opp.description}</p>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(opp.date).toLocaleDateString()} at {opp.time}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{opp.location}</span>
                        <span>{opp.registered}/{opp.capacity} spots filled</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'submit' && (
          <div>
            <p className="text-gray-600 mb-6">Know of an opportunity or resource that would benefit our community? Submit it here for review.</p>
            <SubmissionsTab isPublicMode={true} />
          </div>
        )}

        <p className="text-center text-xs text-gray-400 pt-6 border-t">
          Last updated: {new Date(content.updatedAt).toLocaleDateString()} · Whispering Hills Special Population Resource Connection Database
        </p>
      </div>
    </div>
  );
}
