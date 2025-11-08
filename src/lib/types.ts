
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
  createdAt: string;
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
