// Level in subjects
export const getLevelBadgeColor = (level: number) => {
  switch (level) {
    case 1:
      return 'bg-lightGreen-100 text-lightGreen-500 min-w-[90px] flex items-center justify-center rounded-3xl px-4 py-1';
    case 2:
      return 'bg-orange-100 text-orange-500 min-w-[90px] flex items-center justify-center rounded-3xl px-4 py-1';
    case 3:
      return 'bg-sky-100 text-sky-500 min-w-[90px] flex items-center justify-center rounded-3xl px-4 py-1';
    default:
      return 'bg-gray-100 text-gray-500 min-w-[90px] flex items-center justify-center rounded-3xl px-4 py-1';
  }
};

export const getBookStatusBadgeColor = (status: number) => {
  switch (status) {
    case 1:
      return 'bg-lightGreen-100 text-lightGreen-500 min-w-[90px] flex items-center justify-center rounded-3xl px-4 py-1';
    case 2:
      return 'min-w-[90px] flex items-center justify-center rounded-3xl px-4 py-1 bg-red-100 px-2 py-1 text-red-800';
    default:
      return 'bg-gray-100 text-gray-500 min-w-[90px] flex items-center justify-center rounded-3xl px-4 py-1';
  }
};

export const getTaskCorrectionBadgeColor = (status: 'corrected' | 'notCorrected') => {
  switch (status) {
    case 'corrected':
      return 'bg-lightGreen-100 text-lightGreen-500 min-w-[90px] flex items-center justify-center rounded-3xl px-4 py-1';
    case 'notCorrected':
      return 'bg-red-100 text-red-500 min-w-[90px] flex items-center justify-center rounded-3xl px-4 py-1';
    default:
      return 'bg-gray-100 text-gray-500 min-w-[90px] flex items-center justify-center rounded-3xl px-4 py-1';
  }
};

export const getTaskTypeBadgeColor = (taskType: number) => {
  switch (taskType) {
    case 1:
      return 'bg-lightGreen-100 text-lightGreen-500 min-w-[90px] flex items-center justify-center rounded-3xl px-4 py-1';
    case 2:
      return 'bg-[#FAB9151A] text-[#916905] min-w-[90px] flex items-center justify-center rounded-3xl px-4 py-1';
    case 3:
      return 'bg-[#33C6C91A] text-[#057B7D] min-w-[90px] flex items-center justify-center rounded-3xl px-4 py-1';
    case 4:
      return 'bg-[#8B11B01A] text-[#8B11B0] min-w-[90px] flex items-center justify-center rounded-3xl px-4 py-1';
    case 5:
      return 'bg-blue-100 text-blue-500 min-w-[90px] flex items-center justify-center rounded-3xl px-4 py-1';
    case 6:
      // handle later when get the actual colors for this case
      return 'inline-flex min-w-[90px] justify-center rounded-full bg-rose-100 px-4 py-2 text-rose-700';
    default:
      return 'bg-gray-100 text-gray-500 min-w-[90px] flex items-center justify-center rounded-3xl px-4 py-1';
  }
};
