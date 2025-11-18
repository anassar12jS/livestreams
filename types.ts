export interface TeamInfo {
  name: string;
  badge: string;
}

export interface MatchTeams {
  home?: TeamInfo;
  away?: TeamInfo;
}

export interface Source {
  source: string;
  id: string;
}

export interface Match {
  id: string;
  title: string;
  category: string;
  date: number;
  poster?: string;
  popular: boolean;
  teams?: MatchTeams;
  sources: Source[];
}

export interface Stream {
  id: string;
  streamNo: number;
  language: string;
  hd: boolean;
  embedUrl: string;
  source: string;
}

export interface SportCategory {
  id: string;
  name: string;
}

export enum FilterType {
  ALL = 'all',
  LIVE = 'live',
  TODAY = 'all-today',
}