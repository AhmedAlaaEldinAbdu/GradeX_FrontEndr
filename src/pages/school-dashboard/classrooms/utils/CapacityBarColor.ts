export const getCapacityBarColor = (percentage: number): string => {
  if (percentage <= 35) return 'bg-[#1E7A52]';
  if (percentage <= 70) return 'bg-[#F59E0B]';
  return 'bg-[#EF4444]';
};
