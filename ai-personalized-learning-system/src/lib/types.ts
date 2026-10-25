export type Task = {
  id: string;
  title: string;
  subject: string;
  minutes: number;
  done: boolean;
  day: string;
};

export type Message = { role: "user" | "assistant"; content: string; id: string };
export type StudyProfile = {
  name: string;
  school: string;
  major: string;
  year: string;
  goal: string;
  minutesPerDay: number;
  subjects: string[];
};
