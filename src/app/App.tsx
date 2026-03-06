import { useState, useEffect } from 'react';
import { Users, UserCheck, Calendar, Plus, Edit2, Trash2, AlertCircle, AlertTriangle, Heart, Building2 } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { ClientForm, Client } from './components/ClientForm';
import { CaregiverForm, Caregiver } from './components/CaregiverForm';
import { OpportunityForm, Opportunity } from './components/OpportunityForm';
import { VolunteerForm, Volunteer } from './components/VolunteerForm';
import { SponsorForm, Sponsor } from './components/SponsorForm';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';

function App() {
  const [clients, setClients] = useState<Client[]>([]);
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [useSupabase, setUseSupabase] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showCaregiverForm, setShowCaregiverForm] = useState(false);
  const [showOpportunityForm, setShowOpportunityForm] = useState(false);
  const [showVolunteerForm, setShowVolunteerForm] = useState(false);
  const [showSponsorForm, setShowSponsorForm] = useState(false);
  
  const [editingClient, setEditingClient] = useState<Client | undefined>();
  const [editingCaregiver, setEditingCaregiver] = useState<Caregiver | undefined>();
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | undefined>();
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | undefined>();
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | undefined>();
  const [volunteerSkillFilter, setVolunteerSkillFilter] = useState('');

  // Check if Supabase is configured and load data
  useEffect(() => {
    const configured = isSupabaseConfigured();
    setUseSupabase(configured);
    
    if (configured) {
      loadAllData();
    } else {
      loadFromLocalStorage();
    }
  }, []);

  // Save to localStorage whenever data changes (fallback mode)
  useEffect(() => {
    if (!useSupabase) {
      localStorage.setItem('clients', JSON.stringify(clients));
    }
  }, [clients, useSupabase]);

  useEffect(() => {
    if (!useSupabase) {
      localStorage.setItem('caregivers', JSON.stringify(caregivers));
    }
  }, [caregivers, useSupabase]);

  useEffect(() => {
    if (!useSupabase) {
      localStorage.setItem('opportunities', JSON.stringify(opportunities));
    }
  }, [opportunities, useSupabase]);

  useEffect(() => {
    if (!useSupabase) {
      localStorage.setItem('volunteers', JSON.stringify(volunteers));
    }
  }, [volunteers, useSupabase]);

  useEffect(() => {
    if (!useSupabase) {
      localStorage.setItem('sponsors', JSON.stringify(sponsors));
    }
  }, [sponsors, useSupabase]);

  // Load from localStorage (fallback when Supabase not configured)
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
      await Promise.all([
        loadClients(),
        loadCaregivers(),
        loadOpportunities(),
        loadVolunteers(),
        loadSponsors()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data from Supabase. Using local storage instead.');
      setUseSupabase(false);
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  // Load clients from Supabase
  const loadClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading clients:', error);
      throw error;
    }

    if (data) {
      const formattedClients = data.map(client => ({
        id: client.id,
        firstName: client.first_name,
        lastName: client.last_name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        dateOfBirth: client.date_of_birth,
        emergencyContact: client.emergency_contact,
        emergencyPhone: client.emergency_phone,
        medicalNotes: client.medical_notes || '',
        createdAt: client.created_at,
        updatedAt: client.updated_at,
      }));
      setClients(formattedClients);
    }
  };

  // Load caregivers from Supabase
  const loadCaregivers = async () => {
    const { data, error } = await supabase
      .from('caregivers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading caregivers:', error);
      throw error;
    }

    if (data) {
      const formattedCaregivers = data.map(caregiver => ({
        id: caregiver.id,
        firstName: caregiver.first_name,
        lastName: caregiver.last_name,
        email: caregiver.email,
        phone: caregiver.phone,
        address: caregiver.address,
        certifications: caregiver.certifications || [],
        experience: caregiver.experience,
        availability: caregiver.availability,
        skills: caregiver.skills || '',
        createdAt: caregiver.created_at,
        updatedAt: caregiver.updated_at,
      }));
      setCaregivers(formattedCaregivers);
    }
  };

  // Load opportunities from Supabase
  const loadOpportunities = async () => {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading opportunities:', error);
      throw error;
    }

    if (data) {
      const formattedOpportunities = data.map(opp => ({
        id: opp.id,
        title: opp.title,
        type: opp.type as 'event' | 'activity' | 'workshop' | 'social',
        description: opp.description,
        date: opp.date,
        time: opp.time,
        location: opp.location,
        capacity: opp.capacity,
        registered: opp.registered,
        expiresAt: opp.expires_at,
        sponsorId: opp.sponsor_id,
        createdAt: opp.created_at,
        updatedAt: opp.updated_at,
      }));
      setOpportunities(formattedOpportunities);
    }
  };

  // Load volunteers from Supabase
  const loadVolunteers = async () => {
    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading volunteers:', error);
      throw error;
    }

    if (data) {
      const formattedVolunteers = data.map(volunteer => ({
        id: volunteer.id,
        firstName: volunteer.first_name,
        lastName: volunteer.last_name,
        email: volunteer.email,
        phone: volunteer.phone,
        address: volunteer.address,
        skills: volunteer.skills || [],
        availability: volunteer.availability,
        emergencyContact: volunteer.emergency_contact,
        emergencyPhone: volunteer.emergency_phone,
        notes: volunteer.notes || '',
        createdAt: volunteer.created_at,
        updatedAt: volunteer.updated_at,
      }));
      setVolunteers(formattedVolunteers);
    }
  };

  // Load sponsors from Supabase
  const loadSponsors = async () => {
    const { data, error } = await supabase
      .from('sponsors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading sponsors:', error);
      throw error;
    }

    if (data) {
      const formattedSponsors = data.map(sponsor => ({
        id: sponsor.id,
        name: sponsor.name,
        type: sponsor.type as 'individual' | 'business' | 'nonprofit' | 'government',
        contactPerson: sponsor.contact_person,
        email: sponsor.email,
        phone: sponsor.phone,
        address: sponsor.address,
        website: sponsor.website || '',
        description: sponsor.description || '',
        createdAt: sponsor.created_at,
        updatedAt: sponsor.updated_at,
      }));
      setSponsors(formattedSponsors);
    }
  };

  // Client handlers
  const handleSaveClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!useSupabase) {
      // LocalStorage mode
      if (editingClient) {
        setClients(clients.map(c => 
          c.id === editingClient.id 
            ? { ...clientData, id: c.id, createdAt: c.createdAt, updatedAt: new Date().toISOString() }
            : c
        ));
        setEditingClient(undefined);
      } else {
        const newClient: Client = {
          ...clientData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setClients([...clients, newClient]);
      }
      setShowClientForm(false);
      toast.success(editingClient ? 'Client updated successfully' : 'Client created successfully');
      return;
    }

    // Supabase mode
    try {
      const dbData = {
        first_name: clientData.firstName,
        last_name: clientData.lastName,
        email: clientData.email,
        phone: clientData.phone,
        address: clientData.address,
        date_of_birth: clientData.dateOfBirth,
        emergency_contact: clientData.emergencyContact,
        emergency_phone: clientData.emergencyPhone,
        medical_notes: clientData.medicalNotes,
      };

      if (editingClient) {
        const { error } = await supabase
          .from('clients')
          .update({ ...dbData, updated_at: new Date().toISOString() })
          .eq('id', editingClient.id);

        if (error) throw error;
        toast.success('Client updated successfully');
        setEditingClient(undefined);
      } else {
        const { error } = await supabase
          .from('clients')
          .insert([dbData]);

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

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowClientForm(true);
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client profile?')) return;

    if (!useSupabase) {
      // LocalStorage mode
      setClients(clients.filter(c => c.id !== id));
      toast.success('Client deleted successfully');
      return;
    }

    // Supabase mode
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Client deleted successfully');
      await loadClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client');
    }
  };

  // Caregiver handlers
  const handleSaveCaregiver = async (caregiverData: Omit<Caregiver, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!useSupabase) {
      // LocalStorage mode
      if (editingCaregiver) {
        setCaregivers(caregivers.map(c => 
          c.id === editingCaregiver.id 
            ? { ...caregiverData, id: c.id, createdAt: c.createdAt, updatedAt: new Date().toISOString() }
            : c
        ));
        setEditingCaregiver(undefined);
      } else {
        const newCaregiver: Caregiver = {
          ...caregiverData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setCaregivers([...caregivers, newCaregiver]);
      }
      setShowCaregiverForm(false);
      toast.success(editingCaregiver ? 'Caregiver updated successfully' : 'Caregiver created successfully');
      return;
    }

    // Supabase mode
    try {
      const dbData = {
        first_name: caregiverData.firstName,
        last_name: caregiverData.lastName,
        email: caregiverData.email,
        phone: caregiverData.phone,
        address: caregiverData.address,
        certifications: caregiverData.certifications,
        experience: caregiverData.experience,
        availability: caregiverData.availability,
        skills: caregiverData.skills,
      };

      if (editingCaregiver) {
        const { error } = await supabase
          .from('caregivers')
          .update({ ...dbData, updated_at: new Date().toISOString() })
          .eq('id', editingCaregiver.id);

        if (error) throw error;
        toast.success('Caregiver updated successfully');
        setEditingCaregiver(undefined);
      } else {
        const { error } = await supabase
          .from('caregivers')
          .insert([dbData]);

        if (error) throw error;
        toast.success('Caregiver created successfully');
      }

      setShowCaregiverForm(false);
      await loadCaregivers();
    } catch (error) {
      console.error('Error saving caregiver:', error);
      toast.error('Failed to save caregiver');
    }
  };

  const handleEditCaregiver = (caregiver: Caregiver) => {
    setEditingCaregiver(caregiver);
    setShowCaregiverForm(true);
  };

  const handleDeleteCaregiver = async (id: string) => {
    if (!confirm('Are you sure you want to delete this caregiver profile?')) return;

    if (!useSupabase) {
      // LocalStorage mode
      setCaregivers(caregivers.filter(c => c.id !== id));
      toast.success('Caregiver deleted successfully');
      return;
    }

    // Supabase mode
    try {
      const { error } = await supabase
        .from('caregivers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Caregiver deleted successfully');
      await loadCaregivers();
    } catch (error) {
      console.error('Error deleting caregiver:', error);
      toast.error('Failed to delete caregiver');
    }
  };

  // Opportunity handlers
  const handleSaveOpportunity = async (opportunityData: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt' | 'registered'>) => {
    if (!useSupabase) {
      // LocalStorage mode
      if (editingOpportunity) {
        setOpportunities(opportunities.map(o => 
          o.id === editingOpportunity.id 
            ? { ...opportunityData, id: o.id, createdAt: o.createdAt, updatedAt: new Date().toISOString(), registered: o.registered }
            : o
        ));
        setEditingOpportunity(undefined);
      } else {
        const newOpportunity: Opportunity = {
          ...opportunityData,
          id: Date.now().toString(),
          registered: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setOpportunities([...opportunities, newOpportunity]);
      }
      setShowOpportunityForm(false);
      toast.success(editingOpportunity ? 'Opportunity updated successfully' : 'Opportunity created successfully');
      return;
    }

    // Supabase mode
    try {
      const dbData = {
        title: opportunityData.title,
        type: opportunityData.type,
        description: opportunityData.description,
        date: opportunityData.date,
        time: opportunityData.time,
        location: opportunityData.location,
        capacity: opportunityData.capacity,
        expires_at: opportunityData.expiresAt,
        sponsor_id: opportunityData.sponsorId,
      };

      if (editingOpportunity) {
        const { error } = await supabase
          .from('opportunities')
          .update({ ...dbData, updated_at: new Date().toISOString() })
          .eq('id', editingOpportunity.id);

        if (error) throw error;
        toast.success('Opportunity updated successfully');
        setEditingOpportunity(undefined);
      } else {
        const { error } = await supabase
          .from('opportunities')
          .insert([{ ...dbData, registered: 0 }]);

        if (error) throw error;
        toast.success('Opportunity created successfully');
      }

      setShowOpportunityForm(false);
      await loadOpportunities();
    } catch (error) {
      console.error('Error saving opportunity:', error);
      toast.error('Failed to save opportunity');
    }
  };

  const handleEditOpportunity = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity);
    setShowOpportunityForm(true);
  };

  const handleDeleteOpportunity = async (id: string) => {
    if (!confirm('Are you sure you want to delete this opportunity?')) return;

    if (!useSupabase) {
      // LocalStorage mode
      setOpportunities(opportunities.filter(o => o.id !== id));
      toast.success('Opportunity deleted successfully');
      return;
    }

    // Supabase mode
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Opportunity deleted successfully');
      await loadOpportunities();
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      toast.error('Failed to delete opportunity');
    }
  };

  // Volunteer handlers
  const handleSaveVolunteer = async (volunteerData: Omit<Volunteer, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!useSupabase) {
      // LocalStorage mode
      if (editingVolunteer) {
        setVolunteers(volunteers.map(v => 
          v.id === editingVolunteer.id 
            ? { ...volunteerData, id: v.id, createdAt: v.createdAt, updatedAt: new Date().toISOString() }
            : v
        ));
        setEditingVolunteer(undefined);
      } else {
        const newVolunteer: Volunteer = {
          ...volunteerData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setVolunteers([...volunteers, newVolunteer]);
      }
      setShowVolunteerForm(false);
      toast.success(editingVolunteer ? 'Volunteer updated successfully' : 'Volunteer created successfully');
      return;
    }

    // Supabase mode
    try {
      const dbData = {
        first_name: volunteerData.firstName,
        last_name: volunteerData.lastName,
        email: volunteerData.email,
        phone: volunteerData.phone,
        address: volunteerData.address,
        skills: volunteerData.skills,
        availability: volunteerData.availability,
        emergency_contact: volunteerData.emergencyContact,
        emergency_phone: volunteerData.emergencyPhone,
        notes: volunteerData.notes,
      };

      if (editingVolunteer) {
        const { error } = await supabase
          .from('volunteers')
          .update({ ...dbData, updated_at: new Date().toISOString() })
          .eq('id', editingVolunteer.id);

        if (error) throw error;
        toast.success('Volunteer updated successfully');
        setEditingVolunteer(undefined);
      } else {
        const { error } = await supabase
          .from('volunteers')
          .insert([dbData]);

        if (error) throw error;
        toast.success('Volunteer created successfully');
      }

      setShowVolunteerForm(false);
      await loadVolunteers();
    } catch (error) {
      console.error('Error saving volunteer:', error);
      toast.error('Failed to save volunteer');
    }
  };

  const handleEditVolunteer = (volunteer: Volunteer) => {
    setEditingVolunteer(volunteer);
    setShowVolunteerForm(true);
  };

  const handleDeleteVolunteer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this volunteer record?')) return;

    if (!useSupabase) {
      // LocalStorage mode
      setVolunteers(volunteers.filter(v => v.id !== id));
      toast.success('Volunteer deleted successfully');
      return;
    }

    // Supabase mode
    try {
      const { error } = await supabase
        .from('volunteers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Volunteer deleted successfully');
      await loadVolunteers();
    } catch (error) {
      console.error('Error deleting volunteer:', error);
      toast.error('Failed to delete volunteer');
    }
  };

  // Sponsor handlers
  const handleSaveSponsor = async (sponsorData: Omit<Sponsor, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!useSupabase) {
      // LocalStorage mode
      if (editingSponsor) {
        setSponsors(sponsors.map(s => 
          s.id === editingSponsor.id 
            ? { ...sponsorData, id: s.id, createdAt: s.createdAt, updatedAt: new Date().toISOString() }
            : s
        ));
        setEditingSponsor(undefined);
      } else {
        const newSponsor: Sponsor = {
          ...sponsorData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setSponsors([...sponsors, newSponsor]);
      }
      setShowSponsorForm(false);
      toast.success(editingSponsor ? 'Sponsor updated successfully' : 'Sponsor created successfully');
      return;
    }

    // Supabase mode
    try {
      const dbData = {
        name: sponsorData.name,
        type: sponsorData.type,
        contact_person: sponsorData.contactPerson,
        email: sponsorData.email,
        phone: sponsorData.phone,
        address: sponsorData.address,
        website: sponsorData.website,
        description: sponsorData.description,
      };

      if (editingSponsor) {
        const { error } = await supabase
          .from('sponsors')
          .update({ ...dbData, updated_at: new Date().toISOString() })
          .eq('id', editingSponsor.id);

        if (error) throw error;
        toast.success('Sponsor updated successfully');
        setEditingSponsor(undefined);
      } else {
        const { error } = await supabase
          .from('sponsors')
          .insert([dbData]);

        if (error) throw error;
        toast.success('Sponsor created successfully');
      }

      setShowSponsorForm(false);
      await loadSponsors();
    } catch (error) {
      console.error('Error saving sponsor:', error);
      toast.error('Failed to save sponsor');
    }
  };

  const handleEditSponsor = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor);
    setShowSponsorForm(true);
  };

  const handleDeleteSponsor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sponsor/organization?')) return;

    if (!useSupabase) {
      // LocalStorage mode
      setSponsors(sponsors.filter(s => s.id !== id));
      toast.success('Sponsor deleted successfully');
      return;
    }

    // Supabase mode
    try {
      const { error } = await supabase
        .from('sponsors')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Sponsor deleted successfully');
      await loadSponsors();
    } catch (error) {
      console.error('Error deleting sponsor:', error);
      toast.error('Failed to delete sponsor');
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const handleCancelForm = () => {
    setShowClientForm(false);
    setShowCaregiverForm(false);
    setShowOpportunityForm(false);
    setShowVolunteerForm(false);
    setShowSponsorForm(false);
    setEditingClient(undefined);
    setEditingCaregiver(undefined);
    setEditingOpportunity(undefined);
    setEditingVolunteer(undefined);
    setEditingSponsor(undefined);
  };

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
            {!useSupabase && (
              <Badge variant="outline" className="flex items-center gap-2 px-3 py-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm">LocalStorage Mode</span>
              </Badge>
            )}
          </div>
          {!useSupabase && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-yellow-800">
                    <strong>Supabase not configured.</strong> Data is stored locally in your browser only.
                    To enable cross-account data sharing, set up Supabase by following the instructions in <code>SUPABASE_SETUP.md</code>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clients</p>
                <p className="text-3xl font-semibold mt-1">{clients.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Caregivers</p>
                <p className="text-3xl font-semibold mt-1">{caregivers.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Volunteers</p>
                <p className="text-3xl font-semibold mt-1">{volunteers.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sponsors</p>
                <p className="text-3xl font-semibold mt-1">{sponsors.length}</p>
              </div>
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Opportunities</p>
                <p className="text-3xl font-semibold mt-1">
                  {opportunities.filter(o => !isExpired(o.expiresAt)).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="clients" className="space-y-6">
          <TabsList>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="caregivers">Caregivers</TabsTrigger>
            <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
            <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
            <TabsTrigger value="opportunities">Events & Opportunities</TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Client Profiles</h2>
              <Button onClick={() => setShowClientForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </div>

            {clients.length === 0 ? (
              <Card className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No clients yet. Create your first client profile.</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {clients.map((client) => (
                  <Card key={client.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {client.firstName} {client.lastName}
                        </h3>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p>Email: {client.email}</p>
                          <p>Phone: {client.phone}</p>
                          <p>Address: {client.address}</p>
                          <p>Emergency Contact: {client.emergencyContact} ({client.emergencyPhone})</p>
                        </div>
                        {client.medicalNotes && (
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-sm text-yellow-800">
                              <strong>Medical Notes:</strong> {client.medicalNotes}
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-3">
                          Last updated: {new Date(client.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClient(client)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClient(client.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="caregivers" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Caregiver Profiles</h2>
              <Button onClick={() => setShowCaregiverForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Caregiver
              </Button>
            </div>

            {caregivers.length === 0 ? (
              <Card className="p-12 text-center">
                <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No caregivers yet. Create your first caregiver profile.</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {caregivers.map((caregiver) => (
                  <Card key={caregiver.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {caregiver.firstName} {caregiver.lastName}
                        </h3>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p>Email: {caregiver.email}</p>
                          <p>Phone: {caregiver.phone}</p>
                          <p>Experience: {caregiver.experience}</p>
                          <p>Availability: {caregiver.availability}</p>
                        </div>
                        {caregiver.certifications.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {caregiver.certifications.map((cert) => (
                              <Badge key={cert} variant="secondary">
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {caregiver.skills && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm text-blue-800">
                              <strong>Skills:</strong> {caregiver.skills}
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-3">
                          Last updated: {new Date(caregiver.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCaregiver(caregiver)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCaregiver(caregiver.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="volunteers" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Volunteer Records</h2>
              <Button onClick={() => setShowVolunteerForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Volunteer
              </Button>
            </div>

            {volunteers.length > 0 && (
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Filter by Skill:</label>
                <select
                  value={volunteerSkillFilter}
                  onChange={(e) => setVolunteerSkillFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Skills</option>
                  {Array.from(new Set(volunteers.flatMap(v => v.skills))).sort().map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
                {volunteerSkillFilter && (
                  <button
                    onClick={() => setVolunteerSkillFilter('')}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Clear filter
                  </button>
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
                  .map((volunteer) => (
                  <Card key={volunteer.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {volunteer.firstName} {volunteer.lastName}
                        </h3>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p>Email: {volunteer.email}</p>
                          <p>Phone: {volunteer.phone}</p>
                          <p>Emergency Contact: {volunteer.emergencyContact} ({volunteer.emergencyPhone})</p>
                        </div>
                        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded">
                          <p className="text-sm text-orange-800">
                            <strong>Availability:</strong> {volunteer.availability}
                          </p>
                        </div>
                        {volunteer.skills.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Skills</p>
                            <div className="flex flex-wrap gap-2">
                              {volunteer.skills.map((skill) => (
                                <Badge key={skill} variant="secondary">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {volunteer.notes && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm text-blue-800">
                              <strong>Notes:</strong> {volunteer.notes}
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-3">
                          Last updated: {new Date(volunteer.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditVolunteer(volunteer)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteVolunteer(volunteer.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sponsors" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Sponsors & Organizations</h2>
              <Button onClick={() => setShowSponsorForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Sponsor
              </Button>
            </div>

            {sponsors.length === 0 ? (
              <Card className="p-12 text-center">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No sponsors yet. Create your first sponsor/organization record.</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {sponsors.map((sponsor) => (
                  <Card key={sponsor.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{sponsor.name}</h3>
                          <Badge variant="outline">
                            {sponsor.type}
                          </Badge>
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p>Contact: {sponsor.contactPerson}</p>
                          <p>Email: {sponsor.email}</p>
                          <p>Phone: {sponsor.phone}</p>
                          {sponsor.website && <p>Website: {sponsor.website}</p>}
                          {sponsor.address && <p>Address: {sponsor.address}</p>}
                        </div>
                        {sponsor.description && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                            <p className="text-sm text-green-800">
                              <strong>Description:</strong> {sponsor.description}
                            </p>
                          </div>
                        )}
                        {(() => {
                          const linkedOpps = opportunities.filter(o => o.sponsorId === sponsor.id);
                          return linkedOpps.length > 0 ? (
                            <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded">
                              <p className="text-sm font-medium text-purple-800 mb-2">
                                Sponsored Opportunities ({linkedOpps.length}):
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {linkedOpps.map(opp => (
                                  <Badge key={opp.id} variant="outline" className="text-purple-700 border-purple-300 text-xs">
                                    {opp.title}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded">
                              <p className="text-sm text-gray-500">No opportunities linked yet.</p>
                            </div>
                          );
                        })()}
                        <p className="text-xs text-gray-400 mt-3">
                          Last updated: {new Date(sponsor.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSponsor(sponsor)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSponsor(sponsor.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Events & Opportunities</h2>
              <Button onClick={() => setShowOpportunityForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Opportunity
              </Button>
            </div>

            {opportunities.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No opportunities yet. Create your first event or activity.</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {opportunities.map((opportunity) => {
                  const expired = isExpired(opportunity.expiresAt);
                  return (
                    <Card key={opportunity.id} className={`p-6 ${expired ? 'opacity-60 bg-gray-50' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">{opportunity.title}</h3>
                            <Badge variant={expired ? 'secondary' : 'default'}>
                              {opportunity.type}
                            </Badge>
                            {expired && (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Expired
                              </Badge>
                            )}
                          </div>
                          <p className="mt-2 text-gray-700">{opportunity.description}</p>
                          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                            <p>Date: {new Date(opportunity.date).toLocaleDateString()}</p>
                            <p>Time: {opportunity.time}</p>
                            <p>Location: {opportunity.location}</p>
                            <p>
                              Capacity: {opportunity.registered}/{opportunity.capacity} registered
                            </p>
                            <p>Expires: {new Date(opportunity.expiresAt).toLocaleDateString()}</p>
                            {opportunity.sponsorId && (
                              <p>
                                Sponsor: {sponsors.find(s => s.id === opportunity.sponsorId)?.name || 'Unknown'}
                              </p>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-3">
                            Last updated: {new Date(opportunity.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditOpportunity(opportunity)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteOpportunity(opportunity.id)}
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
          </TabsContent>
        </Tabs>
      </main>

      {showClientForm && (
        <ClientForm
          client={editingClient}
          onSave={handleSaveClient}
          onCancel={handleCancelForm}
        />
      )}

      {showCaregiverForm && (
        <CaregiverForm
          caregiver={editingCaregiver}
          onSave={handleSaveCaregiver}
          onCancel={handleCancelForm}
        />
      )}

      {showOpportunityForm && (
        <OpportunityForm
          opportunity={editingOpportunity}
          sponsors={sponsors}
          onSave={handleSaveOpportunity}
          onCancel={handleCancelForm}
        />
      )}

      {showVolunteerForm && (
        <VolunteerForm
          volunteer={editingVolunteer}
          onSave={handleSaveVolunteer}
          onCancel={handleCancelForm}
        />
      )}

      {showSponsorForm && (
        <SponsorForm
          sponsor={editingSponsor}
          onSave={handleSaveSponsor}
          onCancel={handleCancelForm}
        />
      )}
    </div>
  );
}

export default App;
