export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
}

export interface Card {
  id: number;
  user_id: number;
  card_number: string;
  card_name: string;
  balance: number;
  is_active: boolean;
  issued_date: string;
  expiry_date: string;
  total_trips?: number;
}

export interface Trip {
  id: number;
  card_id: number;
  from_station_code: string;
  from_station_name: string;
  to_station_code: string;
  to_station_name: string;
  fare: number;
  line_name: string;
  entry_time: string;
  exit_time: string;
  trip_date: string;
}

export interface Station {
  station_code: string;
  name_th: string;
  name_en: string;
  line_id: string;
  line_name_th: string;
  line_color: string;
  zone: number;
}

export interface StationGroup {
  line_id: string;
  line_name: string;
  line_color: string;
  stations: Station[];
}

export interface FareResult {
  from: {
    code: string;
    name_th: string;
    name_en: string;
    line: string;
    zone: number;
  };
  to: {
    code: string;
    name_th: string;
    name_en: string;
    line: string;
    zone: number;
  };
  fare: {
    amount: number;
    formatted: string;
    zone_count: number;
    description: string;
  };
  travel: {
    station_count: number;
    estimated_minutes: number;
    estimated_text: string;
  };
  line_info: {
    type: 'direct' | 'interchange';
    line?: string;
    line_color?: string;
    lines?: Array<{ name: string; color: string }>;
    interchange_station?: string;
  };
}
