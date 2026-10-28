export interface FAQ {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  followups: string[];
}

export interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}
