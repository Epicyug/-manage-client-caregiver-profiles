import { useState } from 'react';
import { BarChart2, TrendingUp, Users, Calendar, Heart, Building2, UserCheck, Download, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Client } from './ClientForm';
import { Caregiver } from './CaregiverForm';
import { Volunteer } from './VolunteerForm';
import { Sponsor } from './SponsorForm';
import { Opportunity } from './OpportunityForm';

interface ReportsTabProps {
  clients: Client[];
  caregivers: Caregiver[];
  volunteers: Volunteer[];
  sponsors: Sponsor[];
  opportunities: Opportunity[];
}

type DateRange = '7d' | '30d' | '90d' | 'all';

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
      <div className={`h-2.5 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function StatCard({ label, value, icon, color, sub }: { label: string; value: number | string; icon: React.ReactNode; color: string; sub?: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500">{label}</p>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${color}`}>{icon}</div>
      </div>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </Card>
  );
}

export function ReportsTab({ clients, caregivers, volunteers, sponsors, opportunities }: ReportsTabProps) {
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  const cutoff = (() => {
    if (dateRange === 'all') return new Date(0);
    const d = new Date();
    if (dateRange === '7d') d.setDate(d.getDate() - 7);
    else if (dateRange === '30d') d.setDate(d.getDate() - 30);
    else d.setDate(d.getDate() - 90);
    return d;
  })();

  // Filter records within date range
  const recentClients = clients.filter(c => new Date(c.createdAt) >= cutoff);
  const recentCaregivers = caregivers.filter(c => new Date(c.createdAt) >= cutoff);
  const recentVolunteers = volunteers.filter(v => new Date(v.createdAt) >= cutoff);
  const recentSponsors = sponsors.filter(s => new Date(s.createdAt) >= cutoff);
  const recentOpps = opportunities.filter(o => new Date(o.createdAt) >= cutoff);

  // Opportunity stats
  const activeOpps = opportunities.filter(o => !isExpired(o.expiresAt));
  const expiredOpps = opportunities.filter(o => isExpired(o.expiresAt));
  const totalCapacity = activeOpps.reduce((sum, o) => sum + (o.capacity || 0), 0);
  const totalRegistered = activeOpps.reduce((sum, o) => sum + (o.registered || 0), 0);
  const fillRate = totalCapacity === 0 ? 0 : Math.round((totalRegistered / totalCapacity) * 100);

  // Opportunities by type
  const oppTypes = ['event', 'activity', 'workshop', 'social'];
  const typeBreakdown = oppTypes.map(type => ({
    type,
    count: opportunities.filter(o => o.type === type).length,
    active: activeOpps.filter(o => o.type === type).length,
  }));

  // Top opportunities by registration fill rate
  const topOpps = [...activeOpps]
    .filter(o => o.capacity > 0)
    .map(o => ({ ...o, fillPct: Math.round((o.registered / o.capacity) * 100) }))
    .sort((a, b) => b.fillPct - a.fillPct)
    .slice(0, 5);

  // Sponsor coverage
  const linkedOpps = opportunities.filter(o => o.sponsorId);
  const unlinkedOpps = opportunities.filter(o => !o.sponsorId);

  const rangeLabel = { '7d': 'Last 7 days', '30d': 'Last 30 days', '90d': 'Last 90 days', 'all': 'All time' }[dateRange];

  const handleExportCSV = () => {
    const rows = [
      ['Report Type', 'Value', 'Date Range'],
      ['Total Clients', clients.length, rangeLabel],
      ['New Clients', recentClients.length, rangeLabel],
      ['Total Caregivers', caregivers.length, rangeLabel],
      ['New Caregivers', recentCaregivers.length, rangeLabel],
      ['Total Volunteers', volunteers.length, rangeLabel],
      ['New Volunteers', recentVolunteers.length, rangeLabel],
      ['Total Sponsors', sponsors.length, rangeLabel],
      ['New Sponsors', recentSponsors.length, rangeLabel],
      ['Active Opportunities', activeOpps.length, rangeLabel],
      ['Expired Opportunities', expiredOpps.length, rangeLabel],
      ['Total Capacity', totalCapacity, rangeLabel],
      ['Total Registered', totalRegistered, rangeLabel],
      ['Overall Fill Rate (%)', fillRate, rangeLabel],
      ...typeBreakdown.map(t => [`Opportunities - ${t.type}`, t.count, 'All time']),
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whispering-hills-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold">Reports & Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">System usage statistics and participation trends</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date range selector */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(['7d', '30d', '90d', 'all'] as DateRange[]).map(r => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                  dateRange === r ? 'bg-white text-gray-800 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {r === 'all' ? 'All' : r === '7d' ? '7D' : r === '30d' ? '30D' : '90D'}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Period note */}
      <div className="text-sm text-gray-500 px-1">
        Showing: <strong>{rangeLabel}</strong> — new records added during this period
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="New Clients" value={recentClients.length} icon={<Users className="w-4 h-4 text-blue-600" />} color="bg-blue-100" sub={`${clients.length} total`} />
        <StatCard label="New Caregivers" value={recentCaregivers.length} icon={<UserCheck className="w-4 h-4 text-green-600" />} color="bg-green-100" sub={`${caregivers.length} total`} />
        <StatCard label="New Volunteers" value={recentVolunteers.length} icon={<Heart className="w-4 h-4 text-orange-600" />} color="bg-orange-100" sub={`${volunteers.length} total`} />
        <StatCard label="New Sponsors" value={recentSponsors.length} icon={<Building2 className="w-4 h-4 text-pink-600" />} color="bg-pink-100" sub={`${sponsors.length} total`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Active Opportunities" value={activeOpps.length} icon={<Calendar className="w-4 h-4 text-purple-600" />} color="bg-purple-100" sub={`${expiredOpps.length} expired`} />
        <StatCard label="Overall Fill Rate" value={`${fillRate}%`} icon={<TrendingUp className="w-4 h-4 text-teal-600" />} color="bg-teal-100" sub={`${totalRegistered}/${totalCapacity} spots filled`} />
        <StatCard label="New Opportunities" value={recentOpps.length} icon={<BarChart2 className="w-4 h-4 text-indigo-600" />} color="bg-indigo-100" sub={`${opportunities.length} total`} />
      </div>

      {/* Opportunity breakdown by type */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-purple-600" />
          Opportunities by Type
        </h3>
        <div className="space-y-4">
          {typeBreakdown.map(({ type, count, active }) => (
            <div key={type}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium capitalize">{type}</span>
                  <Badge variant="outline" className="text-xs">{count} total</Badge>
                  {active > 0 && <Badge className="text-xs bg-green-100 text-green-700">{active} active</Badge>}
                </div>
                <span className="text-sm text-gray-500">{opportunities.length === 0 ? 0 : Math.round((count / opportunities.length) * 100)}%</span>
              </div>
              <ProgressBar value={count} max={Math.max(...typeBreakdown.map(t => t.count), 1)} color="bg-purple-400" />
            </div>
          ))}
          {opportunities.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No opportunities recorded yet.</p>
          )}
        </div>
      </Card>

      {/* Participation trends — top opportunities by fill rate */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-teal-600" />
          Participation Trends — Top Active Opportunities by Fill Rate
        </h3>
        {topOpps.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No active opportunities with capacity data.</p>
        ) : (
          <div className="space-y-4">
            {topOpps.map(opp => (
              <div key={opp.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium truncate">{opp.title}</span>
                    <Badge variant="outline" className="text-xs shrink-0">{opp.type}</Badge>
                  </div>
                  <span className="text-sm font-semibold text-teal-700 ml-2 shrink-0">
                    {opp.registered}/{opp.capacity} ({opp.fillPct}%)
                  </span>
                </div>
                <ProgressBar
                  value={opp.registered}
                  max={opp.capacity}
                  color={opp.fillPct >= 80 ? 'bg-red-400' : opp.fillPct >= 50 ? 'bg-yellow-400' : 'bg-teal-400'}
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Sponsor coverage */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-pink-600" />
          Sponsor Coverage
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-pink-50 rounded-lg">
            <p className="text-3xl font-bold text-pink-700">{linkedOpps.length}</p>
            <p className="text-sm text-gray-500 mt-1">Opportunities with sponsors</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-gray-600">{unlinkedOpps.length}</p>
            <p className="text-sm text-gray-500 mt-1">Opportunities without sponsors</p>
          </div>
        </div>
        {opportunities.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Sponsor coverage</span>
              <span>{opportunities.length === 0 ? 0 : Math.round((linkedOpps.length / opportunities.length) * 100)}%</span>
            </div>
            <ProgressBar value={linkedOpps.length} max={opportunities.length} color="bg-pink-400" />
          </div>
        )}
      </Card>

      {/* System health summary */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-600" />
          System Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {[
            { label: 'Total Registered Users', value: clients.length + caregivers.length + volunteers.length },
            { label: 'Total Sponsors/Organizations', value: sponsors.length },
            { label: 'Active Opportunities', value: activeOpps.length },
            { label: 'Expired Opportunities', value: expiredOpps.length },
            { label: 'Total Opportunity Capacity', value: totalCapacity },
            { label: 'Total Registered Participants', value: totalRegistered },
            { label: 'Overall Fill Rate', value: `${fillRate}%` },
            { label: 'Report Generated', value: new Date().toLocaleString() },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">{label}</span>
              <span className="font-semibold text-gray-800">{value}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
