export type Faculty = {
  id: string;
  name: string;
  department: string;
};

export type Token = {
  hash: string;
  used: boolean;
  createdAt: string;
  usedAt?: string;
};

export type Feedback = {
  id: string;
  facultyId: string;
  facultyName: string;
  rating: number;
  comment: string;
  createdAt: string;
};
