import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { X } from 'lucide-react';

export interface Volunteer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  skills: string[];
  availability: string;
  emergencyContact: string;
  emergencyPhone: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface VolunteerFormProps {
  volunteer?: Volunteer;
  onSave: (volunteer: Omit<Volunteer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const SKILL_OPTIONS = [
  'Transportation',
  'Meal Preparation',
  'Companionship',
  'Pet Care',
  'Gardening',
  'Technology Support',
  'Reading/Writing',
  'Exercise/Fitness',
  'Arts & Crafts',
  'Music',
  'Event Planning',
  'Administrative Support',
];

export function VolunteerForm({ volunteer, onSave, onCancel }: VolunteerFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    skills: [] as string[],
    availability: '',
    emergencyContact: '',
    emergencyPhone: '',
    notes: '',
  });

  useEffect(() => {
    if (volunteer) {
      setFormData({
        firstName: volunteer.firstName,
        lastName: volunteer.lastName,
        email: volunteer.email,
        phone: volunteer.phone,
        address: volunteer.address,
        skills: volunteer.skills,
        availability: volunteer.availability,
        emergencyContact: volunteer.emergencyContact,
        emergencyPhone: volunteer.emergencyPhone,
        notes: volunteer.notes,
      });
    }
  }, [volunteer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSkillToggle = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.includes(skill)
        ? formData.skills.filter(s => s !== skill)
        : [...formData.skills, skill],
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {volunteer ? 'Edit Volunteer Record' : 'Create Volunteer Record'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Skills & Interests</Label>
            <div className="grid grid-cols-2 gap-3">
              {SKILL_OPTIONS.map((skill) => (
                <div key={skill} className="flex items-center space-x-2">
                  <Checkbox
                    id={skill}
                    checked={formData.skills.includes(skill)}
                    onCheckedChange={() => handleSkillToggle(skill)}
                  />
                  <label
                    htmlFor={skill}
                    className="text-sm cursor-pointer"
                  >
                    {skill}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability">Availability *</Label>
            <Input
              id="availability"
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              placeholder="e.g., Mondays & Wednesdays, 2-5pm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact *</Label>
              <Input
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Emergency Phone *</Label>
              <Input
                id="emergencyPhone"
                name="emergencyPhone"
                type="tel"
                value={formData.emergencyPhone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Any additional information, preferences, or background checks..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {volunteer ? 'Update Volunteer' : 'Create Volunteer'}
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
