import { useState, useEffect } from 'react';
import {
  Users, UserCheck, Calendar, Plus, Edit2, Trash2,
  AlertCircle, AlertTriangle, Heart, Building2, LogOut,
  Bell, BarChart2, FileText, Globe, Archive, RefreshCw, Eye, EyeOff,
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { ClientForm, Client } from './components/ClientForm';
import { CaregiverForm, Caregiver } from './components/CaregiverForm';
import { OpportunityForm, Opportunity } from './components/OpportunityForm';
import { VolunteerForm, Volunteer } from './components/VolunteerForm';
import { SponsorForm, Sponsor } from './components/SponsorForm';
import { MatchingTab } from './components/MatchingTab';
import { NewsletterTab } from './components/NewsletterTab';
import { NotificationsTab } from './components/NotificationsTab';
import { ReportsTab } from './components/ReportsTab';
import { SubmissionsTab } from './components/SubmissionsTab';
import { PublicPage } from './components/PublicPage';
import { LoginPage } from './components/LoginPage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';

// User roles for req 1401 (role-based access)
type UserRole = 'admin' | 'viewer';

function App() {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isAdminLoggedIn') === 'true');
  const [userRole, setUserRole] = useState<UserRole>(() =>
    (localStorage.getItem('userRole') as UserRole) || 'admin'
  );
  // View toggle: admin dashboard vs public page
  const [showPublicPage, setShowPublicPage] = useState(() =>
    new URLSearchParams(window.location.search).has('public')
  );
  // Sensitive data masking (req 1501)
  const [maskSensitiveData, setMaskSensitiveData] = useState(false);

  const handleLogin = (role: UserRole = 'admin') => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
  };

  const canEdit = userRole === 'admin';

  // Data state
  const [clients, setClients] = useState<Client[]>([]);
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  const [loading, setLoading] = useState(true);
  const [useSupabase, setUseSupabase] = useState(false);

  // Form visibility state
  const [showClientForm, setShowClientForm] = useState(false);
  const [showCaregiverForm, setShowCaregiverForm] = useState(false);
  const [showOpportunityForm, setShowOpportunityForm] = useState(false);
  const [showVolunteerForm, setShowVolunteerForm] = useState(false);
  const [showSponsorForm, setShowSponsorForm] = useState(false);

  // Editing state
  const [editingClient, setEditingClient] = useState<Client | undefined>();
  const [editingCaregiver, setEditingCaregiver] = useState<Caregiver | undefined>();
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | undefined>();
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | undefined>();
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | undefined>();

  // Volunteer skill filter
  const [volunteerSkillFilter, setVolunteerSkillFilter] = useState('');

  useEffect(() => {
    const configured = isSupabaseConfigured();
    setUseSupabase(configured);
    if (configured) {
      loadAllData();
    } else {
      loadFromLocalStorage();
    }
  }, []);

  // Persist to localStorage when not using Supabase
  useEffect(() => { if (!useSupabase) localStorage.setItem('clients', JSON.stringify(clients)); }, [clients, useSupabase]);
  useEffect(() => { if (!useSupabase) localStorage.setItem('caregivers', JSON.stringify(caregivers)); }, [caregivers, useSupabase]);
  useEffect(() => { if (!useSupabase) localStorage.setItem('opportunities', JSON.stringify(opportunities)); }, [opportunities, useSupabase]);
  useEffect(() => { if (!useSupabase) localStorage.setItem('volunteers', JSON.stringify(volunteers)); }, [volunteers, useSupabase]);
  useEffect(() => { if (!useSupabase) localStorage.setItem('sponsors', JSON.stringify(sponsors)); }, [sponsors, useSupabase]);

  const loadFromLocalStorage = () => {
    setLoading(true);
    try {
      const savedClients = localStorage.getItem('clients');
      const savedCaregivers = localStorage.getItem('caregivers');
      const savedOpportunities = localStorage.getItem('opportunities');
      const savedVolunteers = localStorage.getItem('volunteers');
      const savedSponsors = localStorage.getItem('sponsors');
      if (savedClients) setClients(JSON.parse(savedClients));
      if (savedCaregivers) setCaregivers(JSON.parse(savedCaregivers));
      if (savedOpportunities) setOpportunities(JSON.parse(savedOpportunities));
      if (savedVolunteers) setVolunteers(JSON.parse(savedVolunteers));
      if (savedSponsors) setSponsors(JSON.parse(savedSponsors));
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadClients(), loadCaregivers(), loadOpportunities(), loadVolunteers(), loadSponsors()]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data from Supabase. Using local storage instead.');
      setUseSupabase(false);
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    if (data) {
      setClients(data.map(c => ({
        id: c.id, firstName: c.first_name, lastName: c.last_name, email: c.email,
        phone: c.phone, address: c.address, dateOfBirth: c.date_of_birth,
        emergencyContact: c.emergency_contact, emergencyPhone: c.emergency_phone,
        medicalNotes: c.medical_notes || '', createdAt: c.created_at, updatedAt: c.updated_at,
      })));
    }
  };

  const loadCaregivers = async () => {
    const { data, error } = await supabase.from('caregivers').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    if (data) {
      setCaregivers(data.map(c => ({
        id: c.id, firstName: c.first_name, lastName: c.last_name, email: c.email,
        phone: c.phone, address: c.address, certifications: c.certifications || [],
        experience: c.experience, availability: c.availability, skills: c.skills || '',
        createdAt: c.created_at, updatedAt: c.updated_at,
      })));
    }
  };

  const loadOpportunities = async () => {
    const { data, error } = await supabase.from('opportunities').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    if (data) {
      setOpportunities(data.map(o => ({
        id: o.id, title: o.title, type: o.type as Opportunity['type'],
        description: o.description, date: o.date, time: o.time, location: o.location,
        capacity: o.capacity, registered: o.registered, expiresAt: o.expires_at,
        sponsorId: o.sponsor_id, isRecurring: o.is_recurring ?? false,
        recurrencePattern: o.recurrence_pattern ?? 'none',
        recurrenceEndDate: o.recurrence_end_date ?? '',
        isArchived: o.is_archived ?? false, archivedAt: o.archived_at,
        createdAt: o.created_at, updatedAt: o.updated_at,
      })));
    }
  };

  const loadVolunteers = async () => {
    const { data, error } = await supabase.from('volunteers').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    if (data) {
      setVolunteers(data.map(v => ({
        id: v.id, firstName: v.first_name, lastName: v.last_name, email: v.email,
        phone: v.phone, address: v.address, skills: v.skills || [], availability: v.availability,
        emergencyContact: v.emergency_contact, emergencyPhone: v.emergency_phone,
        notes: v.notes || '', createdAt: v.created_at, updatedAt: v.updated_at,
      })));
    }
  };

  const loadSponsors = async () => {
    const { data, error } = await supabase.from('sponsors').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    if (data) {
      setSponsors(data.map(s => ({
        id: s.id, name: s.name, type: s.type as Sponsor['type'],
        contactPerson: s.contact_person, email: s.email, phone: s.phone,
        address: s.address, website: s.website || '', description: s.description || '',
        createdAt: s.created_at, updatedAt: s.updated_at,
      })));
    }
  };

  // ---- Client handlers ----
  const handleSaveClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!useSupabase) {
      if (editingClient) {
        setClients(clients.map(c => c.id === editingClient.id
          ? { ...clientData, id: c.id, createdAt: c.createdAt, updatedAt: new Date().toISOString() } : c));
        setEditingClient(undefined);
      } else {
        setClients([...clients, { ...clientData, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
      }
      setShowClientForm(false);
      toast.success(editingClient ? 'Client updated successfully' : 'Client created successfully');
      return;
    }
    try {
      const dbData = {
        first_name: clientData.firstName, last_name: clientData.lastName, email: clientData.email,
        phone: clientData.phone, address: clientData.address, date_of_birth: clientData.dateOfBirth,
        emergency_contact: clientData.emergencyContact, emergency_phone: clientData.emergencyPhone,
        medical_notes: clientData.medicalNotes,
      };
      if (editingClient) {
        const { error } = await supabase.from('clients').update({ ...dbData, updated_at: new Date().toISOString() }).eq('id', editingClient.id);
        if (error) throw error;
        toast.success('Client updated successfully');
        setEditingClient(undefined);
      } else {
        const { error } = await supabase.from('clients').insert([dbData]);
        if (error) throw error;
        toast.success('Client created successfully');
      }
      setShowClientForm(false);
      await loadClients();
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error('Failed to save client');
    }
  };

  const handleEditClient = (client: Client) => { setEditingClient(client); setShowClientForm(true); };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client profile?')) return;
    if (!useSupabase) { setClients(clients.filter(c => c.id !== id)); toast.success('Client deleted successfully'); return; }
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
      toast.success('Client deleted successfully');
      await loadClients();
    } catch (error) { console.error('Error deleting client:', error); toast.error('Failed to delete client'); }
  };

  // ---- Caregiver handlers ----
  const handleSaveCaregiver = async (caregiverData: Omit<Caregiver, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!useSupabase) {
      if (editingCaregiver) {
        setCaregivers(caregivers.map(c => c.id === editingCaregiver.id
          ? { ...caregiverData, id: c.id, createdAt: c.createdAt, updatedAt: new Date().toISOString() } : c));
        setEditingCaregiver(undefined);
      } else {
        setCaregivers([...caregivers, { ...caregiverData, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
      }
      setShowCaregiverForm(false);
      toast.success(editingCaregiver ? 'Caregiver updated successfully' : 'Caregiver created successfully');
      return;
    }
    try {
      const dbData = {
        first_name: caregiverData.firstName, last_name: caregiverData.lastName, email: caregiverData.email,
        phone: caregiverData.phone, address: caregiverData.address, certifications: caregiverData.certifications,
        experience: caregiverData.experience, availability: caregiverData.availability, skills: caregiverData.skills,
      };
      if (editingCaregiver) {
        const { error } = await supabase.from('caregivers').update({ ...dbData, updated_at: new Date().toISOString() }).eq('id', editingCaregiver.id);
        if (error) throw error;
        toast.success('Caregiver updated successfully');
        setEditingCaregiver(undefined);
      } else {
        const { error } = await supabase.from('caregivers').insert([dbData]);
        if (error) throw error;
        toast.success('Caregiver created successfully');
      }
      setShowCaregiverForm(false);
      await loadCaregivers();
    } catch (error) { console.error('Error saving caregiver:', error); toast.error('Failed to save caregiver'); }
  };

  const handleEditCaregiver = (caregiver: Caregiver) => { setEditingCaregiver(caregiver); setShowCaregiverForm(true); };

  const handleDeleteCaregiver = async (id: string) => {
    if (!confirm('Are you sure you want to delete this caregiver profile?')) return;
    if (!useSupabase) { setCaregivers(caregivers.filter(c => c.id !== id)); toast.success('Caregiver deleted successfully'); return; }
    try {
      const { error } = await supabase.from('caregivers').delete().eq('id', id);
      if (error) throw error;
      toast.success('Caregiver deleted successfully');
      await loadCaregivers();
    } catch (error) { console.error('Error deleting caregiver:', error); toast.error('Failed to delete caregiver'); }
  };

  // ---- Opportunity handlers ----
  const handleSaveOpportunity = async (opportunityData: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt' | 'registered'>) => {
    if (!useSupabase) {
      if (editingOpportunity) {
        setOpportunities(opportunities.map(o => o.id === editingOpportunity.id
          ? { ...opportunityData, id: o.id, createdAt: o.createdAt, updatedAt: new Date().toISOString(), registered: o.registered } : o));
        setEditingOpportunity(undefined);
      } else {
        setOpportunities([...opportunities, { ...opportunityData, id: Date.now().toString(), registered: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
      }
      setShowOpportunityForm(false);
      toast.success(editingOpportunity ? 'Opportunity updated successfully' : 'Opportunity created successfully');
      return;
    }
    try {
      const dbData = {
        title: opportunityData.title, type: opportunityData.type, description: opportunityData.description,
        date: opportunityData.date, time: opportunityData.time, location: opportunityData.location,
        capacity: opportunityData.capacity, expires_at: opportunityData.expiresAt,
        sponsor_id: opportunityData.sponsorId,
        is_recurring: opportunityData.isRecurring,
        recurrence_pattern: opportunityData.recurrencePattern,
        recurrence_end_date: opportunityData.recurrenceEndDate || null,
        is_archived: opportunityData.isArchived,
      };
      if (editingOpportunity) {
        const { error } = await supabase.from('opportunities').update({ ...dbData, updated_at: new Date().toISOString() }).eq('id', editingOpportunity.id);
        if (error) throw error;
        toast.success('Opportunity updated successfully');
        setEditingOpportunity(undefined);
      } else {
        const { error } = await supabase.from('opportunities').insert([{ ...dbData, registered: 0 }]);
        if (error) throw error;
        toast.success('Opportunity created successfully');
      }
      setShowOpportunityForm(false);
      await loadOpportunities();
    } catch (error) { console.error('Error saving opportunity:', error); toast.error('Failed to save opportunity'); }
  };

  const handleEditOpportunity = (opportunity: Opportunity) => { setEditingOpportunity(opportunity); setShowOpportunityForm(true); };

  const handleDeleteOpportunity = async (id: string) => {
    if (!confirm('Are you sure you want to delete this opportunity?')) return;
    if (!useSupabase) { setOpportunities(opportunities.filter(o => o.id !== id)); toast.success('Opportunity deleted successfully'); return; }
    try {
      const { error } = await supabase.from('opportunities').delete().eq('id', id);
      if (error) throw error;
      toast.success('Opportunity deleted successfully');
      await loadOpportunities();
    } catch (error) { console.error('Error deleting opportunity:', error); toast.error('Failed to delete opportunity'); }
  };

  // Archive opportunity (req 1302)
  const handleArchiveOpportunity = (id: string) => {
    setOpportunities(opportunities.map(o =>
      o.id === id ? { ...o, isArchived: true, archivedAt: new Date().toISOString() } : o
    ));
    toast.success('Opportunity archived');
  };

  // Restore from archive (req 1301 - still accessible)
  const handleRestoreOpportunity = (id: string) => {
    setOpportunities(opportunities.map(o =>
      o.id === id ? { ...o, isArchived: false, archivedAt: undefined } : o
    ));
    toast.success('Opportunity restored');
  };

  // ---- Volunteer handlers ----
  const handleSaveVolunteer = async (volunteerData: Omit<Volunteer, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!useSupabase) {
      if (editingVolunteer) {
        setVolunteers(volunteers.map(v => v.id === editingVolunteer.id
          ? { ...volunteerData, id: v.id, createdAt: v.createdAt, updatedAt: new Date().toISOString() } : v));
        setEditingVolunteer(undefined);
      } else {
        setVolunteers([...volunteers, { ...volunteerData, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
      }
      setShowVolunteerForm(false);
      toast.success(editingVolunteer ? 'Volunteer updated successfully' : 'Volunteer created successfully');
      return;
    }
    try {
      const dbData = {
        first_name: volunteerData.firstName, last_name: volunteerData.lastName, email: volunteerData.email,
        phone: volunteerData.phone, address: volunteerData.address, skills: volunteerData.skills,
        availability: volunteerData.availability, emergency_contact: volunteerData.emergencyContact,
        emergency_phone: volunteerData.emergencyPhone, notes: volunteerData.notes,
      };
      if (editingVolunteer) {
        const { error } = await supabase.from('volunteers').update({ ...dbData, updated_at: new Date().toISOString() }).eq('id', editingVolunteer.id);
        if (error) throw error;
        toast.success('Volunteer updated successfully');
        setEditingVolunteer(undefined);
      } else {
        const { error } = await supabase.from('volunteers').insert([dbData]);
        if (error) throw error;
        toast.success('Volunteer created successfully');
      }
      setShowVolunteerForm(false);
      await loadVolunteers();
    } catch (error) { console.error('Error saving volunteer:', error); toast.error('Failed to save volunteer'); }
  };

  const handleEditVolunteer = (volunteer: Volunteer) => { setEditingVolunteer(volunteer); setShowVolunteerForm(true); };

  const handleDeleteVolunteer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this volunteer record?')) return;
    if (!useSupabase) { setVolunteers(volunteers.filter(v => v.id !== id)); toast.success('Volunteer deleted successfully'); return; }
    try {
      const { error } = await supabase.from('volunteers').delete().eq('id', id);
      if (error) throw error;
      toast.success('Volunteer deleted successfully');
      await loadVolunteers();
    } catch (error) { console.error('Error deleting volunteer:', error); toast.error('Failed to delete volunteer'); }
  };

  // ---- Sponsor handlers ----
  const handleSaveSponsor = async (sponsorData: Omit<Sponsor, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!useSupabase) {
      if (editingSponsor) {
        setSponsors(sponsors.map(s => s.id === editingSponsor.id
          ? { ...sponsorData, id: s.id, createdAt: s.createdAt, updatedAt: new Date().toISOString() } : s));
        setEditingSponsor(undefined);
      } else {
        setSponsors([...sponsors, { ...sponsorData, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
      }
      setShowSponsorForm(false);
      toast.success(editingSponsor ? 'Sponsor updated successfully' : 'Sponsor created successfully');
      return;
    }
    try {
      const dbData = {
        name: sponsorData.name, type: sponsorData.type, contact_person: sponsorData.contactPerson,
        email: sponsorData.email, phone: sponsorData.phone, address: sponsorData.address,
        website: sponsorData.website, description: sponsorData.description,
      };
      if (editingSponsor) {
        const { error } = await supabase.from('sponsors').update({ ...dbData, updated_at: new Date().toISOString() }).eq('id', editingSponsor.id);
        if (error) throw error;
        toast.success('Sponsor updated successfully');
        setEditingSponsor(undefined);
      } else {
        const { error } = await supabase.from('sponsors').insert([dbData]);
        if (error) throw error;
        toast.success('Sponsor created successfully');
      }
      setShowSponsorForm(false);
      await loadSponsors();
    } catch (error) { console.error('Error saving sponsor:', error); toast.error('Failed to save sponsor'); }
  };

  const handleEditSponsor = (sponsor: Sponsor) => { setEditingSponsor(sponsor); setShowSponsorForm(true); };

  const handleDeleteSponsor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sponsor/organization?')) return;
    if (!useSupabase) { setSponsors(sponsors.filter(s => s.id !== id)); toast.success('Sponsor deleted successfully'); return; }
    try {
      const { error } = await supabase.from('sponsors').delete().eq('id', id);
      if (error) throw error;
      toast.success('Sponsor deleted successfully');
      await loadSponsors();
    } catch (error) { console.error('Error deleting sponsor:', error); toast.error('Failed to delete sponsor'); }
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  const handleCancelForm = () => {
    setShowClientForm(false); setShowCaregiverForm(false);
    setShowOpportunityForm(false); setShowVolunteerForm(false); setShowSponsorForm(false);
    setEditingClient(undefined); setEditingCaregiver(undefined);
    setEditingOpportunity(undefined); setEditingVolunteer(undefined); setEditingSponsor(undefined);
  };

  // Masking helper (req 1501)
  const mask = (value: string) => maskSensitiveData ? '••••••••' : value;

  // Active (non-archived) vs archived opportunities
  const activeOpportunities = opportunities.filter(o => !o.isArchived);
  const archivedOpportunities = opportunities.filter(o => o.isArchived);

  // Public page (accessible at ?public)
  if (showPublicPage) {
    return (
      <div>
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-white shadow-md"
            onClick={() => setShowPublicPage(false)}
          >
            {isLoggedIn ? 'Admin Dashboard' : 'Admin Login'}
          </Button>
        </div>
        <PublicPage
          isAdmin={isLoggedIn && canEdit}
          opportunities={activeOpportunities}
        />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div>
        <div className="fixed top-4 right-4 z-50">
          <Button size="sm" variant="outline" className="bg-white shadow-md" onClick={() => setShowPublicPage(true)}>
            <Globe className="w-4 h-4 mr-1" /> View Public Page
          </Button>
        </div>
        <LoginPage onLogin={() => handleLogin('admin')} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage profiles, volunteers, sponsors, events, and opportunities</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Role indicator (req 1401) */}
              <Badge variant="outline" className={`px-3 py-1.5 ${userRole === 'admin' ? 'border-blue-300 text-blue-700' : 'border-gray-300 text-gray-600'}`}>
                {userRole === 'admin' ? 'Admin' : 'Viewer'}
              </Badge>
              {/* Sensitive data toggle (req 1501) */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMaskSensitiveData(v => !v)}
                className={`flex items-center gap-2 ${maskSensitiveData ? 'border-orange-300 text-orange-700' : 'text-gray-600'}`}
                title="Toggle sensitive data masking"
              >
                {maskSensitiveData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {maskSensitiveData ? 'Unmask Data' : 'Mask Sensitive'}
              </Button>
              {/* Public page button (req 1101) */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPublicPage(true)}
                className="flex items-center gap-2 text-gray-600"
              >
                <Globe className="w-4 h-4" />
                Public Page
              </Button>
              {!useSupabase && (
                <Badge variant="outline" className="flex items-center gap-2 px-3 py-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm">LocalStorage Mode</span>
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 hover:border-red-300"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
          {!useSupabase && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  <strong>Supabase not configured.</strong> Data is stored locally in your browser only.
                  To enable persistent cross-device data sharing, configure Supabase in <code>SUPABASE_SETUP.md</code>.
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Clients', value: clients.length, icon: <Users className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-100' },
            { label: 'Caregivers', value: caregivers.length, icon: <UserCheck className="w-5 h-5 text-green-600" />, bg: 'bg-green-100' },
            { label: 'Volunteers', value: volunteers.length, icon: <Heart className="w-5 h-5 text-orange-600" />, bg: 'bg-orange-100' },
            { label: 'Sponsors', value: sponsors.length, icon: <Building2 className="w-5 h-5 text-pink-600" />, bg: 'bg-pink-100' },
            { label: 'Active Events', value: activeOpportunities.filter(o => !isExpired(o.expiresAt)).length, icon: <Calendar className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-100' },
            { label: 'Archived', value: archivedOpportunities.length, icon: <Archive className="w-5 h-5 text-gray-500" />, bg: 'bg-gray-100' },
          ].map(({ label, value, icon, bg }) => (
            <Card key={label} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-2xl font-bold mt-0.5">{value}</p>
                </div>
                <div className={`w-10 h-10 ${bg} rounded-full flex items-center justify-center`}>{icon}</div>
              </div>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="clients" className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="flex w-max">
              <TabsTrigger value="clients">Clients</TabsTrigger>
              <TabsTrigger value="caregivers">Caregivers</TabsTrigger>
              <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
              <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
              <TabsTrigger value="opportunities">Events & Opportunities</TabsTrigger>
              <TabsTrigger value="archive" className="flex items-center gap-1">
                <Archive className="w-3.5 h-3.5" />
                Archive
              </TabsTrigger>
              <TabsTrigger value="matching">Matching</TabsTrigger>
              <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-1">
                <Bell className="w-3.5 h-3.5" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="submissions" className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                Submissions
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-1">
                <BarChart2 className="w-3.5 h-3.5" />
                Reports
              </TabsTrigger>
            </TabsList>
          </div>

          {/* CLIENTS TAB */}
          <TabsContent value="clients" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Client Profiles</h2>
              {canEdit && (
                <Button onClick={() => setShowClientForm(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Add Client
                </Button>
              )}
            </div>
            {clients.length === 0 ? (
              <Card className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No clients yet. Create your first client profile.</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {clients.map(client => (
                  <Card key={client.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{client.firstName} {client.lastName}</h3>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p>Email: {client.email}</p>
                          <p>Phone: {mask(client.phone)}</p>
                          <p>Address: {mask(client.address)}</p>
                          <p>Emergency Contact: {mask(client.emergencyContact)} ({mask(client.emergencyPhone)})</p>
                        </div>
                        {client.medicalNotes && (
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-sm text-yellow-800">
                              <strong>Medical Notes:</strong> {mask(client.medicalNotes)}
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-3">Last updated: {new Date(client.updatedAt).toLocaleDateString()}</p>
                      </div>
                      {canEdit && (
                        <div className="flex gap-2 ml-4">
                          <Button variant="outline" size="sm" onClick={() => handleEditClient(client)}><Edit2 className="w-4 h-4" /></Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteClient(client.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* CAREGIVERS TAB */}
          <TabsContent value="caregivers" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Caregiver Profiles</h2>
              {canEdit && (
                <Button onClick={() => setShowCaregiverForm(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Add Caregiver
                </Button>
              )}
            </div>
            {caregivers.length === 0 ? (
              <Card className="p-12 text-center">
                <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No caregivers yet. Create your first caregiver profile.</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {caregivers.map(caregiver => (
                  <Card key={caregiver.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{caregiver.firstName} {caregiver.lastName}</h3>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p>Email: {caregiver.email}</p>
                          <p>Phone: {mask(caregiver.phone)}</p>
                          <p>Experience: {caregiver.experience}</p>
                          <p>Availability: {caregiver.availability}</p>
                        </div>
                        {caregiver.certifications.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {caregiver.certifications.map(cert => <Badge key={cert} variant="secondary">{cert}</Badge>)}
                          </div>
                        )}
                        {caregiver.skills && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm text-blue-800"><strong>Skills:</strong> {caregiver.skills}</p>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-3">Last updated: {new Date(caregiver.updatedAt).toLocaleDateString()}</p>
                      </div>
                      {canEdit && (
                        <div className="flex gap-2 ml-4">
                          <Button variant="outline" size="sm" onClick={() => handleEditCaregiver(caregiver)}><Edit2 className="w-4 h-4" /></Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteCaregiver(caregiver.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* VOLUNTEERS TAB */}
          <TabsContent value="volunteers" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Volunteer Records</h2>
              {canEdit && (
                <Button onClick={() => setShowVolunteerForm(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Add Volunteer
                </Button>
              )}
            </div>
            {volunteers.length > 0 && (
              <div className="flex items-center gap-3 flex-wrap">
                <label className="text-sm font-medium text-gray-700">Filter by Skill:</label>
                <select
                  value={volunteerSkillFilter}
                  onChange={e => setVolunteerSkillFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Skills</option>
                  {Array.from(new Set(volunteers.flatMap(v => v.skills))).sort().map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
                {volunteerSkillFilter && (
                  <button onClick={() => setVolunteerSkillFilter('')} className="text-sm text-blue-600 hover:text-blue-800 underline">Clear filter</button>
                )}
                <span className="text-sm text-gray-500">
                  {volunteers.filter(v => !volunteerSkillFilter || v.skills.includes(volunteerSkillFilter)).length} of {volunteers.length} volunteers
                </span>
              </div>
            )}
            {volunteers.length === 0 ? (
              <Card className="p-12 text-center">
                <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No volunteers yet. Create your first volunteer record.</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {volunteers
                  .filter(v => !volunteerSkillFilter || v.skills.includes(volunteerSkillFilter))
                  .map(volunteer => (
                  <Card key={volunteer.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{volunteer.firstName} {volunteer.lastName}</h3>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p>Email: {volunteer.email}</p>
                          <p>Phone: {mask(volunteer.phone)}</p>
                          <p>Emergency Contact: {mask(volunteer.emergencyContact)} ({mask(volunteer.emergencyPhone)})</p>
                        </div>
                        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded">
                          <p className="text-sm text-orange-800"><strong>Availability:</strong> {volunteer.availability}</p>
                        </div>
                        {volunteer.skills.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Skills</p>
                            <div className="flex flex-wrap gap-2">
                              {volunteer.skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                            </div>
                          </div>
                        )}
                        {volunteer.notes && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm text-blue-800"><strong>Notes:</strong> {volunteer.notes}</p>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-3">Last updated: {new Date(volunteer.updatedAt).toLocaleDateString()}</p>
                      </div>
                      {canEdit && (
                        <div className="flex gap-2 ml-4">
                          <Button variant="outline" size="sm" onClick={() => handleEditVolunteer(volunteer)}><Edit2 className="w-4 h-4" /></Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteVolunteer(volunteer.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* SPONSORS TAB */}
          <TabsContent value="sponsors" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Sponsors & Organizations</h2>
              {canEdit && (
                <Button onClick={() => setShowSponsorForm(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Add Sponsor
                </Button>
              )}
            </div>
            {sponsors.length === 0 ? (
              <Card className="p-12 text-center">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No sponsors yet. Create your first sponsor/organization record.</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {sponsors.map(sponsor => (
                  <Card key={sponsor.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{sponsor.name}</h3>
                          <Badge variant="outline">{sponsor.type}</Badge>
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p>Contact: {sponsor.contactPerson}</p>
                          <p>Email: {sponsor.email}</p>
                          <p>Phone: {mask(sponsor.phone)}</p>
                          {sponsor.website && <p>Website: {sponsor.website}</p>}
                          {sponsor.address && <p>Address: {sponsor.address}</p>}
                        </div>
                        {sponsor.description && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                            <p className="text-sm text-green-800"><strong>Description:</strong> {sponsor.description}</p>
                          </div>
                        )}
                        {(() => {
                          const linkedOpps = activeOpportunities.filter(o => o.sponsorId === sponsor.id);
                          return linkedOpps.length > 0 ? (
                            <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded">
                              <p className="text-sm font-medium text-purple-800 mb-2">Sponsored Opportunities ({linkedOpps.length}):</p>
                              <div className="flex flex-wrap gap-1">
                                {linkedOpps.map(opp => (
                                  <Badge key={opp.id} variant="outline" className="text-purple-700 border-purple-300 text-xs">{opp.title}</Badge>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded">
                              <p className="text-sm text-gray-500">No opportunities linked yet.</p>
                            </div>
                          );
                        })()}
                        <p className="text-xs text-gray-400 mt-3">Last updated: {new Date(sponsor.updatedAt).toLocaleDateString()}</p>
                      </div>
                      {canEdit && (
                        <div className="flex gap-2 ml-4">
                          <Button variant="outline" size="sm" onClick={() => handleEditSponsor(sponsor)}><Edit2 className="w-4 h-4" /></Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteSponsor(sponsor.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* OPPORTUNITIES TAB */}
          <TabsContent value="opportunities" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Events & Opportunities</h2>
              {canEdit && (
                <Button onClick={() => setShowOpportunityForm(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Add Opportunity
                </Button>
              )}
            </div>
            {activeOpportunities.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No opportunities yet. Create your first event or activity.</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {activeOpportunities.map(opportunity => {
                  const expired = isExpired(opportunity.expiresAt);
                  return (
                    <Card key={opportunity.id} className={`p-6 ${expired ? 'opacity-60 bg-gray-50' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-semibold text-lg">{opportunity.title}</h3>
                            <Badge variant={expired ? 'secondary' : 'default'}>{opportunity.type}</Badge>
                            {expired && (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Expired
                              </Badge>
                            )}
                            {opportunity.isRecurring && (
                              <Badge variant="outline" className="flex items-center gap-1 text-blue-600 border-blue-300">
                                <RefreshCw className="w-3 h-3" /> Recurring ({opportunity.recurrencePattern})
                              </Badge>
                            )}
                          </div>
                          <p className="mt-2 text-gray-700">{opportunity.description}</p>
                          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                            <p>Date: {new Date(opportunity.date).toLocaleDateString()}</p>
                            <p>Time: {opportunity.time}</p>
                            <p>Location: {opportunity.location}</p>
                            <p>Capacity: {opportunity.registered}/{opportunity.capacity} registered</p>
                            <p>Expires: {new Date(opportunity.expiresAt).toLocaleDateString()}</p>
                            {opportunity.sponsorId && (
                              <p>Sponsor: {sponsors.find(s => s.id === opportunity.sponsorId)?.name || 'Unknown'}</p>
                            )}
                            {opportunity.isRecurring && opportunity.recurrenceEndDate && (
                              <p>Recurs until: {new Date(opportunity.recurrenceEndDate).toLocaleDateString()}</p>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-3">Last updated: {new Date(opportunity.updatedAt).toLocaleDateString()}</p>
                        </div>
                        {canEdit && (
                          <div className="flex gap-2 ml-4 flex-wrap">
                            <Button variant="outline" size="sm" onClick={() => handleEditOpportunity(opportunity)}><Edit2 className="w-4 h-4" /></Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleArchiveOpportunity(opportunity.id)}
                              title="Archive this opportunity"
                              className="text-gray-500 hover:text-orange-600"
                            >
                              <Archive className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteOpportunity(opportunity.id)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ARCHIVE TAB (req 1301, 1302) */}
          <TabsContent value="archive" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Archive className="w-5 h-5 text-gray-500" /> Archived Opportunities
              </h2>
              <p className="text-sm text-gray-500 mt-1">Historical records of past and expired opportunities. These can be restored if needed.</p>
            </div>
            {archivedOpportunities.length === 0 ? (
              <Card className="p-12 text-center">
                <Archive className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No archived opportunities yet.</p>
                <p className="text-sm text-gray-400 mt-1">Use the archive button on any opportunity to move it here.</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {archivedOpportunities.map(opportunity => (
                  <Card key={opportunity.id} className="p-6 bg-gray-50 opacity-80">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-semibold text-lg text-gray-600">{opportunity.title}</h3>
                          <Badge variant="secondary">{opportunity.type}</Badge>
                          <Badge variant="outline" className="text-gray-500">Archived</Badge>
                        </div>
                        <p className="mt-2 text-gray-500 text-sm">{opportunity.description}</p>
                        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-500">
                          <p>Date: {new Date(opportunity.date).toLocaleDateString()}</p>
                          <p>Location: {opportunity.location}</p>
                          <p>Capacity: {opportunity.registered}/{opportunity.capacity}</p>
                          {opportunity.archivedAt && <p>Archived: {new Date(opportunity.archivedAt).toLocaleDateString()}</p>}
                        </div>
                      </div>
                      {canEdit && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestoreOpportunity(opportunity.id)}
                            className="text-blue-600 hover:border-blue-400"
                          >
                            Restore
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteOpportunity(opportunity.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* MATCHING TAB */}
          <TabsContent value="matching">
            <MatchingTab clients={clients} opportunities={activeOpportunities} sponsors={sponsors} />
          </TabsContent>

          {/* NEWSLETTER TAB */}
          <TabsContent value="newsletter">
            <NewsletterTab clients={clients} caregivers={caregivers} volunteers={volunteers} sponsors={sponsors} />
          </TabsContent>

          {/* NOTIFICATIONS TAB (req 901, 902) */}
          <TabsContent value="notifications">
            <NotificationsTab clients={clients} caregivers={caregivers} volunteers={volunteers} sponsors={sponsors} />
          </TabsContent>

          {/* SUBMISSIONS TAB (req 701, 702, 801, 802) */}
          <TabsContent value="submissions">
            <SubmissionsTab />
          </TabsContent>

          {/* REPORTS TAB (req 1001, 1002) */}
          <TabsContent value="reports">
            <ReportsTab
              clients={clients}
              caregivers={caregivers}
              volunteers={volunteers}
              sponsors={sponsors}
              opportunities={opportunities}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Forms */}
      {showClientForm && canEdit && (
        <ClientForm client={editingClient} onSave={handleSaveClient} onCancel={handleCancelForm} />
      )}
      {showCaregiverForm && canEdit && (
        <CaregiverForm caregiver={editingCaregiver} onSave={handleSaveCaregiver} onCancel={handleCancelForm} />
      )}
      {showOpportunityForm && canEdit && (
        <OpportunityForm opportunity={editingOpportunity} sponsors={sponsors} onSave={handleSaveOpportunity} onCancel={handleCancelForm} />
      )}
      {showVolunteerForm && canEdit && (
        <VolunteerForm volunteer={editingVolunteer} onSave={handleSaveVolunteer} onCancel={handleCancelForm} />
      )}
      {showSponsorForm && canEdit && (
        <SponsorForm sponsor={editingSponsor} onSave={handleSaveSponsor} onCancel={handleCancelForm} />
      )}
    </div>
  );
}

export default App;
