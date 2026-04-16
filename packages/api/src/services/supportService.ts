export type ComplaintRecord = {
  id: string;
  subject: string;
  description: string;
  category: string;
  status: 'submitted' | 'reviewing';
  trackingCode: string;
  createdAt: string;
};

const complaints: ComplaintRecord[] = [];

export const supportService = {
  submit(subject: string, description: string, category = 'general'): ComplaintRecord {
    const complaint: ComplaintRecord = {
      id: `cmp_${complaints.length + 1}`,
      subject,
      description,
      category,
      status: 'submitted',
      trackingCode: `AML-${String(complaints.length + 1).padStart(4, '0')}`,
      createdAt: new Date().toISOString(),
    };

    complaints.unshift(complaint);
    return complaint;
  },
  list(): ComplaintRecord[] {
    return complaints;
  },
};
