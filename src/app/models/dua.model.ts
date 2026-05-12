

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
  textAr?: string;
  transcription?: string;
  reference?: string;
  dateAdded: Date;
  answeredAt?: Date;
  answerNote?: string;
  isAnswered: boolean;
  isCustom: boolean;
  originalDuaId?: string;
}
