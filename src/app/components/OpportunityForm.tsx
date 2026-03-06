import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { X } from 'lucide-react';
import { Sponsor } from './SponsorForm';

export interface Opportunity {
  id: string;
  title: string;
  type: 'event' | 'activity' | 'workshop' | 'social';
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  registered: number;
  expiresAt: string;
  sponsorId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface OpportunityFormProps {
  opportunity?: Opportunity;
  sponsors: Sponsor[];
  onSave: (opportunity: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt' | 'registered'>) => void;
  onCancel: () => void;
}

export function OpportunityForm({ opportunity, sponsors, onSave, onCancel }: OpportunityFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'event' as 'event' | 'activity' | 'workshop' | 'social',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: 20,
    expiresAt: '',
    sponsorId: null as string | null,
  });

  useEffect(() => {
    if (opportunity) {
      setFormData({
        title: opportunity.title,
        type: opportunity.type,
        description: opportunity.description,
        date: opportunity.date,
        time: opportunity.time,
        location: opportunity.location,
        capacity: opportunity.capacity,
        expiresAt: opportunity.expiresAt,
        sponsorId: opportunity.sponsorId,
      });
    }
  }, [opportunity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {opportunity ? 'Edit Opportunity' : 'Create Opportunity'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="activity">Activity</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="social">Social Gathering</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Address or venue name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity *</Label>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              min="1"
              value={formData.capacity}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expires On *</Label>
            <Input
              id="expiresAt"
              name="expiresAt"
              type="date"
              value={formData.expiresAt}
              onChange={handleChange}
              required
            />
            <p className="text-sm text-gray-500">
              Opportunity will be marked as expired after this date
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sponsorId">Sponsor/Organization</Label>
            <Select
              value={formData.sponsorId || 'none'}
              onValueChange={(value) => setFormData({ ...formData, sponsorId: value === 'none' ? null : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a sponsor (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Sponsor</SelectItem>
                {sponsors.map((sponsor) => (
                  <SelectItem key={sponsor.id} value={sponsor.id}>
                    {sponsor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Link this opportunity to a sponsor or organization
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {opportunity ? 'Update Opportunity' : 'Create Opportunity'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
