import { useState, useMemo } from 'react';
import { Search, Target, Filter, X, Users, Calendar, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Client } from './ClientForm';
import { Opportunity } from './OpportunityForm';
import { Sponsor } from './SponsorForm';

interface MatchingTabProps {
  clients: Client[];
  opportunities: Opportunity[];
  sponsors: Sponsor[];
}

interface MatchResult {
  opportunity: Opportunity;
  score: number;
  reasons: string[];
}

const OPPORTUNITY_TYPES = ['event', 'activity', 'workshop', 'social'] as const;

function scoreOpportunity(client: Client, opportunity: Opportunity): MatchResult {
  const reasons: string[] = [];
  let score = 0;

  const now = new Date();
  const expires = new Date(opportunity.expiresAt);
  if (expires < now) {
    return { opportunity, score: -1, reasons: [] };
  }

  // Available capacity
  if (opportunity.registered < opportunity.capacity) {
    score += 20;
    reasons.push('Has available spots');
  } else {
    return { opportunity, score: -1, reasons: [] };
  }

  // Keyword match: client medicalNotes vs opportunity title/description
  if (client.medicalNotes) {
    const notes = client.medicalNotes.toLowerCase();
    const oppText = `${opportunity.title} ${opportunity.description}`.toLowerCase();
    const noteWords = notes.split(/\s+/).filter(w => w.length > 3);
    const matchedWords = noteWords.filter(w => oppText.includes(w));
    if (matchedWords.length > 0) {
      score += matchedWords.length * 15;
      reasons.push(`Matches care notes keywords`);
    }
  }

  // Future date gets a boost
  const oppDate = new Date(opportunity.date);
  if (oppDate >= now) {
    score += 10;
    reasons.push('Upcoming event');
  }

  if (reasons.length === 1) {
    // Only "has available spots" — still a valid match
    score += 5;
  }

  return { opportunity, score, reasons };
}

export function MatchingTab({ clients, opportunities, sponsors }: MatchingTabProps) {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [hasQueried, setHasQueried] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterAvailableOnly, setFilterAvailableOnly] = useState(true);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const matchResults: MatchResult[] = useMemo(() => {
    if (!selectedClient || !hasQueried) return [];
    return opportunities
      .map(opp => scoreOpportunity(selectedClient, opp))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [selectedClient, opportunities, hasQueried]);

  const filteredResults = useMemo(() => {
    return matchResults.filter(r => {
      if (filterType && r.opportunity.type !== filterType) return false;
      if (filterAvailableOnly && r.opportunity.registered >= r.opportunity.capacity) return false;
      if (filterKeyword) {
        const kw = filterKeyword.toLowerCase();
        const text = `${r.opportunity.title} ${r.opportunity.description} ${r.opportunity.location}`.toLowerCase();
        if (!text.includes(kw)) return false;
      }
      return true;
    });
  }, [matchResults, filterType, filterKeyword, filterAvailableOnly]);

  const handleRunQuery = () => {
    if (!selectedClientId) return;
    setHasQueried(true);
  };

  const handleClearFilters = () => {
    setFilterType('');
    setFilterKeyword('');
    setFilterAvailableOnly(true);
  };

  const getScoreLabel = (score: number) => {
    if (score >= 40) return { label: 'Strong Match', color: 'bg-green-100 text-green-800 border-green-300' };
    if (score >= 20) return { label: 'Good Match', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    return { label: 'Possible Match', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Client–Opportunity Matching</h2>
      </div>

      {/* Query Panel */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-gray-800">Run Matching Query</h3>
        </div>

        <div className="flex items-end gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Client</label>
            <select
              value={selectedClientId}
              onChange={e => { setSelectedClientId(e.target.value); setHasQueried(false); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Choose a client —</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleRunQuery}
            disabled={!selectedClientId}
            className="flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Run Matching Query
          </Button>
        </div>

        {selectedClient && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
            <strong>{selectedClient.firstName} {selectedClient.lastName}</strong>
            {selectedClient.medicalNotes && (
              <span className="ml-2 text-blue-600">· Care notes: {selectedClient.medicalNotes.slice(0, 80)}{selectedClient.medicalNotes.length > 80 ? '…' : ''}</span>
            )}
          </div>
        )}
      </Card>

      {/* Filter Panel */}
      {hasQueried && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter Results</span>
            {(filterType || filterKeyword || !filterAvailableOnly) && (
              <button onClick={handleClearFilters} className="ml-auto text-xs text-blue-600 hover:underline flex items-center gap-1">
                <X className="w-3 h-3" />Clear filters
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Opportunity Type</label>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {OPPORTUNITY_TYPES.map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Keyword</label>
              <input
                type="text"
                value={filterKeyword}
                onChange={e => setFilterKeyword(e.target.value)}
                placeholder="Search title, description…"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filterAvailableOnly}
                onChange={e => setFilterAvailableOnly(e.target.checked)}
                className="rounded"
              />
              Available spots only
            </label>

            <span className="text-sm text-gray-500 ml-auto">
              {filteredResults.length} of {matchResults.length} match{matchResults.length !== 1 ? 'es' : ''}
            </span>
          </div>
        </Card>
      )}

      {/* Results */}
      {hasQueried && (
        <>
          {filteredResults.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {matchResults.length === 0
                  ? 'No matching opportunities found for this client.'
                  : 'No results match the current filters.'}
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredResults.map(({ opportunity, score, reasons }) => {
                const scoreInfo = getScoreLabel(score);
                const sponsor = sponsors.find(s => s.id === opportunity.sponsorId);
                const spotsLeft = opportunity.capacity - opportunity.registered;
                return (
                  <Card key={opportunity.id} className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-semibold text-base">{opportunity.title}</h3>
                          <Badge variant="outline">{opportunity.type}</Badge>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${scoreInfo.color}`}>
                            {scoreInfo.label}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{opportunity.description}</p>
                        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
                          <span><Calendar className="w-3 h-3 inline mr-1" />{new Date(opportunity.date).toLocaleDateString()} at {opportunity.time}</span>
                          <span>📍 {opportunity.location}</span>
                          <span className={spotsLeft <= 3 ? 'text-orange-600 font-medium' : ''}>
                            {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
                          </span>
                          {sponsor && <span>Sponsor: {sponsor.name}</span>}
                        </div>
                        {reasons.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {reasons.map((r, i) => (
                              <span key={i} className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                                <CheckCircle className="w-3 h-3" />{r}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {!hasQueried && clients.length === 0 && (
        <Card className="p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No clients yet. Add clients first to run matching queries.</p>
        </Card>
      )}
    </div>
  );
}
