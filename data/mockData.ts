/**
 * Mock Data for Testing
 * Use this data to populate stores for testing without database
 */

import { UserProfile } from '../store/userProfileStore';
import { Team } from '../store/teamStore';
import { Tournament } from '../store/tournamentManagementStore';
import { Match } from '../store/matchStore';

/**
 * Mock Players Data
 */
export const mockPlayers: Partial<UserProfile>[] = [
  {
    id: 'player-1',
    email: 'john@test.com',
    fullName: 'John Smith',
    displayName: 'John S',
    playerRole: 'Batsman',
    runs: 1250,
    wickets: 0,
    matchesPlayed: 25,
    battingAverage: 45.50,
    strikeRate: 125.30,
    economyRate: null,
    rating: 75.5,
    location: 'Karachi',
  },
  {
    id: 'player-2',
    email: 'mike@test.com',
    fullName: 'Mike Johnson',
    displayName: 'Mike J',
    playerRole: 'Bowler',
    runs: 150,
    wickets: 45,
    matchesPlayed: 25,
    battingAverage: 12.50,
    strikeRate: 85.20,
    economyRate: 5.80,
    rating: 72.3,
    location: 'Lahore',
  },
  {
    id: 'player-3',
    email: 'david@test.com',
    fullName: 'David Williams',
    displayName: 'David W',
    playerRole: 'All-rounder',
    runs: 850,
    wickets: 30,
    matchesPlayed: 25,
    battingAverage: 35.20,
    strikeRate: 110.50,
    economyRate: 6.20,
    rating: 78.9,
    location: 'Islamabad',
  },
  {
    id: 'player-4',
    email: 'chris@test.com',
    fullName: 'Chris Brown',
    displayName: 'Chris B',
    playerRole: 'Wicketkeeper',
    runs: 680,
    wickets: 5,
    matchesPlayed: 25,
    battingAverage: 28.30,
    strikeRate: 95.40,
    economyRate: null,
    rating: 68.2,
    location: 'Multan',
  },
  {
    id: 'player-5',
    email: 'alex@test.com',
    fullName: 'Alex Davis',
    displayName: 'Alex D',
    playerRole: 'Batsman',
    runs: 980,
    wickets: 0,
    matchesPlayed: 25,
    battingAverage: 42.60,
    strikeRate: 118.70,
    economyRate: null,
    rating: 71.8,
    location: 'Karachi',
  },
  {
    id: 'player-6',
    email: 'sam@test.com',
    fullName: 'Sam Wilson',
    displayName: 'Sam W',
    playerRole: 'Bowler',
    runs: 200,
    wickets: 52,
    matchesPlayed: 25,
    battingAverage: 15.40,
    strikeRate: 78.90,
    economyRate: 5.50,
    rating: 74.1,
    location: 'Lahore',
  },
  {
    id: 'player-7',
    email: 'tom@test.com',
    fullName: 'Tom Anderson',
    displayName: 'Tom A',
    playerRole: 'All-rounder',
    runs: 720,
    wickets: 28,
    matchesPlayed: 25,
    battingAverage: 32.70,
    strikeRate: 105.30,
    economyRate: 6.50,
    rating: 70.5,
    location: 'Islamabad',
  },
  {
    id: 'player-8',
    email: 'ryan@test.com',
    fullName: 'Ryan Taylor',
    displayName: 'Ryan T',
    playerRole: 'Batsman',
    runs: 1100,
    wickets: 0,
    matchesPlayed: 25,
    battingAverage: 48.70,
    strikeRate: 122.10,
    economyRate: null,
    rating: 76.4,
    location: 'Multan',
  },
];

/**
 * Mock Teams Data
 */
export const mockTeams: Partial<Team>[] = [
  {
    id: 'team-1',
    ownerId: 'player-1',
    ownerName: 'John Smith',
    name: 'Karachi Kings',
    description: 'Championship winning team',
    status: 'official',
    minPlayers: 11,
    totalPlayers: 11,
    acceptedPlayers: 11,
    captainId: 'player-1',
    captainName: 'John Smith',
  },
  {
    id: 'team-2',
    ownerId: 'player-2',
    ownerName: 'Mike Johnson',
    name: 'Lahore Lions',
    description: 'Strong batting lineup',
    status: 'official',
    minPlayers: 11,
    totalPlayers: 11,
    acceptedPlayers: 11,
    captainId: 'player-2',
    captainName: 'Mike Johnson',
  },
  {
    id: 'team-3',
    ownerId: 'player-3',
    ownerName: 'David Williams',
    name: 'Islamabad Eagles',
    description: 'Balanced team',
    status: 'official',
    minPlayers: 11,
    totalPlayers: 11,
    acceptedPlayers: 11,
    captainId: 'player-3',
    captainName: 'David Williams',
  },
  {
    id: 'team-4',
    ownerId: 'player-4',
    ownerName: 'Chris Brown',
    name: 'Multan Tigers',
    description: 'Aggressive playing style',
    status: 'official',
    minPlayers: 11,
    totalPlayers: 11,
    acceptedPlayers: 11,
    captainId: 'player-4',
    captainName: 'Chris Brown',
  },
];

/**
 * Mock Tournaments Data
 */
export const mockTournaments: Partial<Tournament>[] = [
  {
    id: 'tournament-1',
    creatorId: 'player-1',
    creatorName: 'John Smith',
    name: 'Summer Cricket Championship 2024',
    description: 'Premier cricket tournament featuring top teams',
    format: 'T20',
    type: 'league',
    entryFee: 5000,
    prizeDistribution: [
      { position: 1, amount: 100000, percentage: 50 },
      { position: 2, amount: 50000, percentage: 25 },
      { position: 3, amount: 30000, percentage: 15 },
    ],
    status: 'official',
    minTeams: 8,
    currentTeams: 4,
    totalMatches: 12,
    completedMatches: 0,
  },
];

/**
 * Mock Matches Data
 */
export const mockMatches: Partial<Match>[] = [
  {
    id: 'match-1',
    tournamentId: 'tournament-1',
    matchNumber: 1,
    team1Id: 'team-1',
    team1Name: 'Karachi Kings',
    team2Id: 'team-2',
    team2Name: 'Lahore Lions',
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    scheduledTime: '14:00:00',
    venueId: 'venue-1',
    venueName: 'National Cricket Stadium',
    format: 'T20',
    overs: 20,
    status: 'scheduled',
  },
  {
    id: 'match-2',
    tournamentId: 'tournament-1',
    matchNumber: 2,
    team1Id: 'team-3',
    team1Name: 'Islamabad Eagles',
    team2Id: 'team-4',
    team2Name: 'Multan Tigers',
    scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    scheduledTime: '14:00:00',
    venueId: 'venue-1',
    venueName: 'National Cricket Stadium',
    format: 'T20',
    overs: 20,
    status: 'scheduled',
  },
  {
    id: 'match-3',
    tournamentId: 'tournament-1',
    matchNumber: 3,
    team1Id: 'team-1',
    team1Name: 'Karachi Kings',
    team2Id: 'team-3',
    team2Name: 'Islamabad Eagles',
    scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    scheduledTime: '14:00:00',
    venueId: 'venue-1',
    venueName: 'National Cricket Stadium',
    format: 'T20',
    overs: 20,
    status: 'scheduled',
  },
];

/**
 * Helper function to load mock data into stores
 */
export const loadMockData = () => {
  // This will be used by stores to initialize with mock data
  return {
    players: mockPlayers,
    teams: mockTeams,
    tournaments: mockTournaments,
    matches: mockMatches,
  };
};

