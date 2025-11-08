

export type User = {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  locale: string;
}

export type Prescription = {
  id: string;
  patientId: string;
  imageUrl: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  status: 'Active' | 'Inactive' | 'Pending' | 'Reviewed' | 'Flagged';
  createdAt: string;
};

export type CarePlan = {
  id: string;
  patientId: string;
  prescriptionId: string;
  createdAt: any; // Can be a server timestamp
};

export type Task = {
  id: string;
  carePlanId: string;
  type: string;
  text_en: string;
  text_kn: string;
  dueDate: string;
  status: 'Pending' | 'Completed' | 'Missed';
};

export type TaskLog = {
    id: string;
    taskId: string;
    completedAt: any; // Can be a server timestamp
}

export type Chat = {
  id: string;
  participants: string[];
  lastMessage?: string;
  updatedAt: any; // server timestamp
};

export type Message = {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  attachments?: string[];
  createdAt: any; // server timestamp
};
