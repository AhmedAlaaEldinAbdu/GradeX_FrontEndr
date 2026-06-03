import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';
import Button from '@/shared/components/Button';
import SearchInput from '@/shared/components/SearchInput';
import CustomImage from '@/shared/components/CustomImage';
import ArrowDownSmIcon from '@gradex/assets/icons/ArrowDownSm.svg';
import DefaultAvatar from '@gradex/assets/images/profile.png';

type Student = { id: string; nameKey: string };
type Grade = { id: string; nameKey: string; students: Student[] };

const SAMPLE_STUDENT = 'eLearning.selectStudents.sampleStudent';

const GRADES: Grade[] = [
  { id: 'g1', nameKey: 'eLearning.selectStudents.grades.g1', students: [] },
  { id: 'g2', nameKey: 'eLearning.selectStudents.grades.g2', students: [] },
  {
    id: 'g3',
    nameKey: 'eLearning.selectStudents.grades.g3',
    students: [
      { id: 's1', nameKey: SAMPLE_STUDENT },
      { id: 's2', nameKey: SAMPLE_STUDENT },
      { id: 's3', nameKey: SAMPLE_STUDENT },
      { id: 's4', nameKey: SAMPLE_STUDENT },
    ],
  },
];

function CheckBox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors ${
        checked ? 'border-green-500 bg-green-500/10' : 'border-[#DDE0E0] bg-white'
      }`}
    >
      {checked && (
        <svg
          className="h-4 w-4 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  );
}

type SelectStudentsPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  value: string[];
  onConfirm: (selectedIds: string[]) => void;
};

export default function SelectStudentsPopup({
  isOpen,
  onClose,
  value,
  onConfirm,
}: SelectStudentsPopupProps) {
  const { t } = useTranslation();

  const [selected, setSelected] = useState<string[]>(value);
  const [openGrade, setOpenGrade] = useState<string | null>('g3');
  const [globalSearch, setGlobalSearch] = useState('');
  const [gradeSearch, setGradeSearch] = useState<Record<string, string>>({});

  // Re-seed local selection whenever the popup is (re)opened.
  useEffect(() => {
    if (isOpen) {
      setSelected(value);
      setGlobalSearch('');
      setGradeSearch({});
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const visibleGrades = useMemo(
    () => GRADES.filter((grade) => !globalSearch || t(grade.nameKey).includes(globalSearch)),
    [globalSearch, t]
  );

  const toggleStudent = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('eLearning.selectStudents.title')} size="sm">
      <div className="flex h-full flex-col gap-4">
        {/* Global search */}
        <SearchInput
          value={globalSearch}
          onChange={setGlobalSearch}
          placeholder={t('eLearning.selectStudents.searchPlaceholder')}
        />

        {/* Grade accordions */}
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
          {visibleGrades.map((grade) => {
            const isOpenGrade = openGrade === grade.id;
            const query = gradeSearch[grade.id] ?? '';
            const students = grade.students.filter((s) => !query || t(s.nameKey).includes(query));

            return (
              <div key={grade.id} className="rounded-2xl border border-[#DDE0E0]">
                <button
                  type="button"
                  onClick={() => setOpenGrade(isOpenGrade ? null : grade.id)}
                  className="flex w-full items-center justify-between gap-2 p-4 text-start"
                >
                  <span className="text-sm font-normal text-[#3A3A3A]">{t(grade.nameKey)}</span>
                  <CustomImage
                    src={ArrowDownSmIcon}
                    alt=""
                    className={`h-2.5 w-2.5 transition-transform ${isOpenGrade ? '' : 'rotate-180'}`}
                  />
                </button>

                {isOpenGrade && (
                  <div className="flex flex-col gap-3 border-t border-[#E6E6E6] p-4 ps-6">
                    <SearchInput
                      value={query}
                      onChange={(v) => setGradeSearch((prev) => ({ ...prev, [grade.id]: v }))}
                      placeholder={t('eLearning.selectStudents.studentSearchPlaceholder')}
                    />
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[#DDE0E0]">
                            <CustomImage
                              src={DefaultAvatar}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span className="text-sm font-normal text-[#3A3A3A]">{t(student.nameKey)}</span>
                        </div>
                        <CheckBox
                          checked={selected.includes(student.id)}
                          onChange={() => toggleStudent(student.id)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => {
              onConfirm(selected);
              onClose();
            }}
          >
            {t('eLearning.selectStudents.confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
