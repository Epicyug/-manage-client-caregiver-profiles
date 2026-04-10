import { useState } from 'react';
import { FileText, CheckCircle, XCircle, Clock, Plus, Trash2, Eye, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

export interface Submission {
  id: string;
  submitterName: string;
  submitterEmail: string;
  opportunityTitle: string;
  type: 'event' | 'resource' | 'service' | 'other';
  description: string;
  location?: string;
  website?: string;
  contactPhone?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

interface SubmissionsTabProps {
  isPublicMode?: boolean; // when true, shows public submission form only
}

const INITIAL_FORM: Omit<Submission, 'id' | 'status' | 'submittedAt'> = {
  submitterName: '',
  submitterEmail: '',
  opportunityTitle: '',
  type: 'event',
  description: '',
  location: '',
  website: '',
  contactPhone: '',
};

function StatusBadge({ status }: { status: Submission['status'] }) {
  if (status === 'approved') return <Badge className="bg-green-100 text-green-700 border-green-300"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
  if (status === 'rejected') return <Badge className="bg-red-100 text-red-700 border-red-300"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
  return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
}

export function SubmissionsTab({ isPublicMode = false }: SubmissionsTabProps) {
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    try {
      const saved = localStorage.getItem('submissions');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [showForm, setShowForm] = useState(isPublicMode);
  const [form, setForm] = useState(INITIAL_FORM);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({ notes: '' });
  const [submitted, setSubmitted] = useState(false);

  const saveSubmissions = (updated: Submission[]) => {
    setSubmissions(updated);
    localStorage.setItem('submissions', JSON.stringify(updated));
  };

  const handleSubmit = () => {
    if (!form.submitterName.trim() || !form.submitterEmail.trim() || !form.opportunityTitle.trim() || !form.description.trim()) {
      alert('Please fill in all required fields.');
      return;
    }
    const newSub: Submission = {
      ...form,
      id: Date.now().toString(),
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    saveSubmissions([newSub, ...submissions]);
    setForm(INITIAL_FORM);
    if (isPublicMode) {
      setSubmitted(true);
    } else {
      setShowForm(false);
    }
  };

  const handleApprove = (id: string) => {
    saveSubmissions(submissions.map(s =>
      s.id === id
        ? { ...s, status: 'approved', reviewedAt: new Date().toISOString(), reviewNotes: reviewForm.notes }
        : s
    ));
    setViewingId(null);
    setReviewForm({ notes: '' });
  };

  const handleReject = (id: string) => {
    if (!reviewForm.notes.trim()) {
      alert('Please add a reason for rejection in the review notes.');
      return;
    }
    saveSubmissions(submissions.map(s =>
      s.id === id
        ? { ...s, status: 'rejected', reviewedAt: new Date().toISOString(), reviewNotes: reviewForm.notes }
        : s
    ));
    setViewingId(null);
    setReviewForm({ notes: '' });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this submission?')) return;
    saveSubmissions(submissions.filter(s => s.id !== id));
  };

  const filtered = submissions.filter(s => filterStatus === 'all' || s.status === filterStatus);
  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const viewing = viewingId ? submissions.find(s => s.id === viewingId) : null;

  // Public mode: just show the submission form (after submit, show success)
  if (isPublicMode) {
    if (submitted) {
      return (
        <div className="text-center py-12 space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-semibold text-gray-800">Submission Received!</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Thank you for submitting your information. Our administrator will review your submission and get back to you soon.
          </p>
          <Button onClick={() => setSubmitted(false)} variant="outline">Submit Another</Button>
        </div>
      );
    }
    return (
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Share an Opportunity</h2>
          <p className="text-gray-500 mt-1 text-sm">Submit information about an event, resource, or service to be reviewed and potentially added to our database.</p>
        </div>
        {renderForm(form, setForm, handleSubmit, () => {}, false)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold">Form Submissions</h2>
          <p className="text-sm text-gray-500 mt-1">Review and approve or reject public submissions</p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 px-3 py-1.5">
              {pendingCount} pending review
            </Badge>
          )}
          <Button onClick={() => setShowForm(v => !v)} variant="outline" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Test Submission
          </Button>
        </div>
      </div>

      {/* Add submission form (for testing) */}
      {showForm && (
        <Card className="p-6 border-blue-200 bg-blue-50/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">New Submission</h3>
            <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
          </div>
          {renderForm(form, setForm, () => { handleSubmit(); setShowForm(false); }, () => setShowForm(false), true)}
        </Card>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              filterStatus === s ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            {s === 'all' ? `All (${submissions.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${submissions.filter(sub => sub.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Submission list */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No {filterStatus === 'all' ? '' : filterStatus} submissions yet.</p>
          <p className="text-sm text-gray-400 mt-1">Public users can submit opportunities via the public resource page.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(sub => (
            <Card key={sub.id} className={`p-5 ${sub.status === 'approved' ? 'border-green-200' : sub.status === 'rejected' ? 'border-red-200 opacity-80' : 'border-yellow-200'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{sub.opportunityTitle}</h3>
                    <Badge variant="outline" className="text-xs capitalize">{sub.type}</Badge>
                    <StatusBadge status={sub.status} />
                  </div>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{sub.description}</p>
                  <div className="mt-2 text-xs text-gray-400 flex flex-wrap gap-3">
                    <span>From: {sub.submitterName} ({sub.submitterEmail})</span>
                    <span>Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</span>
                    {sub.reviewedAt && <span>Reviewed: {new Date(sub.reviewedAt).toLocaleDateString()}</span>}
                  </div>
                  {sub.reviewNotes && (
                    <div className={`mt-2 p-2 rounded text-xs ${sub.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                      <strong>Review notes:</strong> {sub.reviewNotes}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  {sub.status === 'pending' && (
                    <Button size="sm" variant="outline" className="flex items-center gap-1" onClick={() => { setViewingId(sub.id); setReviewForm({ notes: '' }); }}>
                      <Eye className="w-3 h-3" />
                      Review
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleDelete(sub.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Review modal */}
      {viewing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Review Submission</h3>
              <button onClick={() => setViewingId(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div><strong>Title:</strong> {viewing.opportunityTitle}</div>
              <div><strong>Type:</strong> <span className="capitalize">{viewing.type}</span></div>
              <div><strong>Description:</strong> <p className="mt-1 text-gray-600">{viewing.description}</p></div>
              {viewing.location && <div><strong>Location:</strong> {viewing.location}</div>}
              {viewing.website && <div><strong>Website:</strong> {viewing.website}</div>}
              {viewing.contactPhone && <div><strong>Phone:</strong> {viewing.contactPhone}</div>}
              <div><strong>Submitted by:</strong> {viewing.submitterName} — {viewing.submitterEmail}</div>
              <div><strong>Submitted:</strong> {new Date(viewing.submittedAt).toLocaleString()}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Review Notes (required for rejection)</label>
              <textarea
                value={reviewForm.notes}
                onChange={e => setReviewForm({ notes: e.target.value })}
                placeholder="Add notes about this submission…"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setViewingId(null)}>Cancel</Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={() => handleReject(viewing.id)}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => handleApprove(viewing.id)}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function renderForm(
  form: typeof INITIAL_FORM,
  setForm: React.Dispatch<React.SetStateAction<typeof INITIAL_FORM>>,
  onSubmit: () => void,
  onCancel: () => void,
  showCancel: boolean
) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
          <input
            type="text"
            value={form.submitterName}
            onChange={e => setForm(f => ({ ...f, submitterName: e.target.value }))}
            placeholder="Full name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Email *</label>
          <input
            type="email"
            value={form.submitterEmail}
            onChange={e => setForm(f => ({ ...f, submitterEmail: e.target.value }))}
            placeholder="email@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Opportunity Title *</label>
          <input
            type="text"
            value={form.opportunityTitle}
            onChange={e => setForm(f => ({ ...f, opportunityTitle: e.target.value }))}
            placeholder="Event or resource name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
          <select
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value as typeof form.type }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="event">Event</option>
            <option value="resource">Resource</option>
            <option value="service">Service</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
        <textarea
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Describe the opportunity, resource, or service…"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            value={form.location || ''}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            placeholder="Address or online"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={form.contactPhone || ''}
            onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))}
            placeholder="Contact phone"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <input
            type="url"
            value={form.website || ''}
            onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
            placeholder="https://…"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        {showCancel && <Button variant="outline" onClick={onCancel}>Cancel</Button>}
        <Button
          onClick={onSubmit}
          disabled={!form.submitterName.trim() || !form.submitterEmail.trim() || !form.opportunityTitle.trim() || !form.description.trim()}
        >
          Submit for Review
        </Button>
      </div>
    </div>
  );
}
