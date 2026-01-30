import { Highlight } from './db';

// Sample highlights for the "Best Of" page
// These will be replaced with AI-curated content later
const SAMPLE_HIGHLIGHTS: Highlight[] = [
  {
    id: '1',
    quote: "That's a league winner right there. Write it down.",
    episode_id: 'a9m6FjHYZqA',
    episode_title: 'Swolecast, May 22, 2024 - 2024 Best Ball Draft #2',
    host: 'Dave',
    tags: ['best-ball', 'draft-strategy', 'bold-takes'],
  },
  {
    id: '2',
    quote: "You can't teach speed. Either you have it or you're playing fantasy baseball.",
    episode_id: '-O_jpoOh1Yc',
    episode_title: 'Swolecast, May 15, 2024 - 1st Best Ball Draft of 2024',
    host: 'Davis',
    tags: ['player-analysis', 'hot-takes'],
  },
  {
    id: '3',
    quote: "The algorithm doesn't lie. The algorithm is undefeated.",
    episode_id: '74z0YJ-U0ZE',
    episode_title: 'Swolecast, May 1, 2024 - NFL Draft Review',
    host: 'Pete',
    tags: ['analytics', 'draft-review'],
  },
  {
    id: '4',
    quote: "I'm telling you, this is the hill I die on this year.",
    episode_id: 'VoSpCUHfatA',
    episode_title: 'Swolecast - 2024 NFL Draft Edition',
    host: 'Dan',
    tags: ['bold-takes', 'draft-strategy'],
  },
  {
    id: '5',
    quote: "If you're not in the war room at 3 AM, are you even a real fantasy manager?",
    episode_id: 'rKnj6JMvt5A',
    episode_title: 'Swolecast - Making Moves',
    host: 'Dave',
    tags: ['lifestyle', 'dedication'],
  },
  {
    id: '6',
    quote: "Zero RB is not a strategy, it's a lifestyle choice.",
    episode_id: 'a9m6FjHYZqA',
    episode_title: 'Swolecast, May 22, 2024 - 2024 Best Ball Draft #2',
    host: 'Davis',
    tags: ['draft-strategy', 'hot-takes', 'zero-rb'],
  },
];

const HOSTS = ['Dave', 'Davis', 'Pete', 'Dan'];
const ALL_TAGS = [...new Set(SAMPLE_HIGHLIGHTS.flatMap(h => h.tags))].sort();

export function getHighlights(options?: {
  host?: string;
  tag?: string;
}): Highlight[] {
  let results = [...SAMPLE_HIGHLIGHTS];

  if (options?.host) {
    results = results.filter(h => h.host === options.host);
  }

  if (options?.tag) {
    results = results.filter(h => h.tags.includes(options.tag!));
  }

  return results;
}

export function getHosts(): string[] {
  return HOSTS;
}

export function getAllTags(): string[] {
  return ALL_TAGS;
}

export function getFeaturedHighlights(limit: number = 3): Highlight[] {
  return SAMPLE_HIGHLIGHTS.slice(0, limit);
}
