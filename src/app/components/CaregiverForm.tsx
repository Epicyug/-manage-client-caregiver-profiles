import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { X } from 'lucide-react';

export interface Caregiver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  certifications: string[];
  experience: string;
  availability: string;
  skills: string;
  createdAt: string;
  updatedAt: string;
}

interface CaregiverFormProps {
  caregiver?: Caregiver;
  onSave: (caregiver: Omit<Caregiver, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const CERTIFICATION_OPTIONS = [
  'CPR Certified',
  'First Aid',
  'CNA (Certified Nursing Assistant)',
  'HHA (Home Health Aide)',
  'Dementia Care',
  'Medication Management',
];

export function CaregiverForm({ caregiver, onSave, onCancel }: CaregiverFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    certifications: [] as string[],
    experience: '',
    availability: '',
    skills: '',
  });

  useEffect(() => {
    if (caregiver) {
      setFormData({
        firstName: caregiver.firstName,
        lastName: caregiver.lastName,
        email: caregiver.email,
        phone: caregiver.phone,
        address: caregiver.address,
        certifications: caregiver.certifications,
        experience: caregiver.experience,
        availability: caregiver.availability,
        skills: caregiver.skills,
      });
    }
  }, [caregiver]);

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

  const handleCertificationToggle = (cert: string) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.includes(cert)
        ? formData.certifications.filter(c => c !== cert)
        : [...formData.certifications, cert],
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {caregiver ? 'Edit Caregiver Profile' : 'Create Caregiver Profile'}
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
            <Label>Certifications</Label>
            <div className="grid grid-cols-2 gap-3">
              {CERTIFICATION_OPTIONS.map((cert) => (
                <div key={cert} className="flex items-center space-x-2">
                  <Checkbox
                    id={cert}
                    checked={formData.certifications.includes(cert)}
                    onCheckedChange={() => handleCertificationToggle(cert)}
                  />
                  <label
                    htmlFor={cert}
                    className="text-sm cursor-pointer"
                  >
                    {cert}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Years of Experience *</Label>
            <Input
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              placeholder="e.g., 5 years"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability">Availability *</Label>
            <Input
              id="availability"
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              placeholder="e.g., Weekdays 9am-5pm, Weekends"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Special Skills & Qualifications</Label>
            <Textarea
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              rows={4}
              placeholder="Any additional skills, languages spoken, special training..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {caregiver ? 'Update Caregiver' : 'Create Caregiver'}
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
