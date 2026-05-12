

export interface Dua {
  id: string;
  source: 'Quran' | 'Sunnah';
  textRu: string;
  textAr?: string;
  transcription?: string;
  reference?: string;
}

export interface UserDua {
  id: string;
  category?: string;
  text: string;
  dateAdded: Date;
  isAnswered: boolean;
  isCustom: boolean;
  originalDuaId?: string;
}
