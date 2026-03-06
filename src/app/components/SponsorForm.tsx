import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { X } from 'lucide-react';

export interface Sponsor {
  id: string;
  name: string;
  type: 'individual' | 'business' | 'nonprofit' | 'government';
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface SponsorFormProps {
  sponsor?: Sponsor;
  onSave: (sponsor: Omit<Sponsor, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function SponsorForm({ sponsor, onSave, onCancel }: SponsorFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'business' as 'individual' | 'business' | 'nonprofit' | 'government',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    description: '',
  });

  useEffect(() => {
    if (sponsor) {
      setFormData({
        name: sponsor.name,
        type: sponsor.type,
        contactPerson: sponsor.contactPerson,
        email: sponsor.email,
        phone: sponsor.phone,
        address: sponsor.address,
        website: sponsor.website,
        description: sponsor.description,
      });
    }
  }, [sponsor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {sponsor ? 'Edit Sponsor/Organization' : 'Create Sponsor/Organization'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Organization/Individual Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="individual">Individual</option>
              <option value="business">Business</option>
              <option value="nonprofit">Non-Profit Organization</option>
              <option value="government">Government Agency</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person *</Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Information about the sponsor/organization, services provided, areas of support..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {sponsor ? 'Update Sponsor' : 'Create Sponsor'}
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
