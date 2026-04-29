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
