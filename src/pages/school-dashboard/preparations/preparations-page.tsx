import PageHeader from '@/shared/components/PageHeader';
import PlusIcon from '@gradex/assets/icons/Plus.svg';
import PreparationsList from './components/PreparationsList';

export default function PreparationsPage() {
  return (
    <div>
      <PageHeader
        title="preparations.title"
        actions={[
          {
            label: 'preparations.addPreparation',
            to: '/calendar/preparations/add-preparation',
            variant: 'primary',
            imgSrc: PlusIcon,
            imgClassName: 'w-[20px] h-[20px]',
          },
        ]}
        hasHeaderControls={true}
      />

      <PreparationsList />
    </div>
  );
}
