import type { StudyProfile, Task } from "./types";

export const defaultProfile: StudyProfile = {
  name: "Minh Anh",
  school: "Đại học",
  major: "Công nghệ thông tin",
  year: "Năm 2",
  goal: "Nắm vững cấu trúc dữ liệu và thuật toán",
  minutesPerDay: 60,
  subjects: ["Cấu trúc dữ liệu", "Cơ sở dữ liệu", "Toán rời rạc"],
};

export const initialTasks: Task[] = [
  { id: "t1", title: "Ôn tập cây nhị phân tìm kiếm", subject: "Cấu trúc dữ liệu", minutes: 25, done: true, day: "Hôm nay" },
  { id: "t2", title: "Luyện 5 bài tập về cây AVL", subject: "Cấu trúc dữ liệu", minutes: 30, done: false, day: "Hôm nay" },
  { id: "t3", title: "Đọc lại khóa ngoại và phép JOIN", subject: "Cơ sở dữ liệu", minutes: 20, done: false, day: "Hôm nay" },
  { id: "t4", title: "Làm 10 câu quan hệ và tập hợp", subject: "Toán rời rạc", minutes: 25, done: false, day: "Ngày mai" },
];

export const chartData = [
  { day: "T2", hours: 1.1, score: 62 },
  { day: "T3", hours: 1.6, score: 70 },
  { day: "T4", hours: 0.8, score: 67 },
  { day: "T5", hours: 1.9, score: 76 },
  { day: "T6", hours: 1.4, score: 82 },
  { day: "T7", hours: 2.2, score: 86 },
  { day: "CN", hours: 1.2, score: 88 },
];
