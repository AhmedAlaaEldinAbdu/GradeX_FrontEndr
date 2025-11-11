export const ACADEMICSYSTEM = 'AcademicSystem';
export const EDUCATIONALSTAGES = 'EducationalStages';

export interface IAcademicSystemProps {
  setSelectedTab: (tab: typeof ACADEMICSYSTEM | typeof EDUCATIONALSTAGES) => void;
}
