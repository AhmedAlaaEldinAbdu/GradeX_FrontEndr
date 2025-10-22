import NotificationForm from './NotificationForm';

export default function EditNotification() {
  const mockData = {
    sentTo: 'دولة,مدينة',
    recipientType: 'مصر',
    recipientNames: 'القاهرة',
    date: '2025-02-22',
    content: 'هذه هو محتوي الاشعار',
    attachmentFile: 'document.pdf',
  };

  return <NotificationForm mode="edit" initialData={mockData} />;
}
