
'use client';
import { PrescriptionUploader } from '@/components/prescription-uploader';
import { DashboardHeader } from '@/components/dashboard-header';

export default function NewPrescriptionPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader title="Add New Prescription" />
      <PrescriptionUploader />
    </div>
  );
}
