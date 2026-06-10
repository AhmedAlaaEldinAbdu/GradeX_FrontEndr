import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';
import Button from '@/shared/components/Button';
import SearchInput from '@/shared/components/SearchInput';
import CustomImage from '@/shared/components/CustomImage';
import { studentsApiService } from '@/services/api/students/students.service';
import type { StudentDto } from '@/services/api/types/students.types';
import ArrowDownSmIcon from '@gradex/assets/icons/ArrowDownSm.svg';
import DefaultAvatar from '@gradex/assets/images/profile.png';

export type ClassroomOption = { id: string; name: string };

/** A picked student, with enough info for the summary chip in the students step. */
export type SelectedStudent = { id: string; name: string; avatar?: string | null };

const studentName = (student: StudentDto): string =>
  [student.firstName, student.secondName, student.thirdName, student.fourthName]
    .filter(Boolean)
    .join(' ') || student.name;

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
  /** Classrooms picked in the الصف field — each becomes an accordion. */
  classrooms: ClassroomOption[];
  value: string[];
  onConfirm: (selected: SelectedStudent[]) => void;
};

export default function SelectStudentsPopup({
  isOpen,
  onClose,
  classrooms,
  value,
  onConfirm,
}: SelectStudentsPopupProps) {
  const { t } = useTranslation();

  const [selected, setSelected] = useState<string[]>(value);
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [globalSearch, setGlobalSearch] = useState('');
  const [classroomSearch, setClassroomSearch] = useState<Record<string, string>>({});
  const [studentsByClassroom, setStudentsByClassroom] = useState<Record<string, StudentDto[]>>({});
  const [loadingClassroom, setLoadingClassroom] = useState<Record<string, boolean>>({});
  const fetchedRef = useRef<Set<string>>(new Set());

  // Re-seed the local state whenever the popup is (re)opened; expand every classroom.
  useEffect(() => {
    if (isOpen) {
      setSelected(value);
      setGlobalSearch('');
      setClassroomSearch({});
      setOpenIds(classrooms.map((c) => c.id));
    } else {
      fetchedRef.current = new Set();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Eagerly load the students of every selected classroom so they're all displayed.
  useEffect(() => {
    if (!isOpen) return;
    classrooms.forEach((classroom) => {
      if (fetchedRef.current.has(classroom.id)) return;
      fetchedRef.current.add(classroom.id);
      setLoadingClassroom((prev) => ({ ...prev, [classroom.id]: true }));
      studentsApiService
        .getStudentsByClassroomId(classroom.id)
        .then((students) =>
          setStudentsByClassroom((prev) => ({ ...prev, [classroom.id]: students }))
        )
        .catch(() => setStudentsByClassroom((prev) => ({ ...prev, [classroom.id]: [] })))
        .finally(() => setLoadingClassroom((prev) => ({ ...prev, [classroom.id]: false })));
    });
  }, [isOpen, classrooms]);

  const visibleClassrooms = useMemo(
    () => classrooms.filter((c) => !globalSearch || c.name.includes(globalSearch)),
    [classrooms, globalSearch]
  );

  const toggleClassroom = (id: string) =>
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleStudent = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  // Flat id → student lookup across all loaded classrooms, to resolve the picked ids.
  const studentsById = useMemo(() => {
    const map = new Map<string, StudentDto>();
    Object.values(studentsByClassroom).forEach((list) =>
      list.forEach((student) => map.set(student.id, student))
    );
    return map;
  }, [studentsByClassroom]);

  const handleConfirm = () => {
    const picked: SelectedStudent[] = selected.map((id) => {
      const student = studentsById.get(id);
      return {
        id,
        name: student ? studentName(student) : '',
        avatar: student?.profilePicture ?? null,
      };
    });
    onConfirm(picked);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('eLearning.selectStudents.title')}
      size="sm"
      contentClassName="h-[550px]"
    >
      <div className="flex h-full flex-col gap-4">
        {/* Global search */}
        <SearchInput
          value={globalSearch}
          onChange={setGlobalSearch}
          placeholder={t('eLearning.selectStudents.searchPlaceholder')}
        />

        {/* Classroom accordions */}
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
          {visibleClassrooms.length === 0 ? (
            <p className="py-6 text-center text-sm font-normal text-[#646969]">
              {t('common.noDataFound')}
            </p>
          ) : (
            visibleClassrooms.map((classroom) => {
              const isOpenClassroom = openIds.includes(classroom.id);
              const query = classroomSearch[classroom.id] ?? '';
              const all = studentsByClassroom[classroom.id] ?? [];
              const students = all.filter((s) => !query || studentName(s).includes(query));
              const isLoading = loadingClassroom[classroom.id];

              return (
                <div key={classroom.id} className="rounded-2xl border border-[#DDE0E0]">
                  <button
                    type="button"
                    onClick={() => toggleClassroom(classroom.id)}
                    className="flex w-full items-center justify-between gap-2 p-4 text-start"
                  >
                    <span className="text-sm font-normal text-[#3A3A3A]">{classroom.name}</span>
                    <CustomImage
                      src={ArrowDownSmIcon}
                      alt=""
                      className={`h-2.5 w-2.5 transition-transform ${isOpenClassroom ? '' : 'rotate-180'}`}
                    />
                  </button>

                  {isOpenClassroom && (
                    <div className="flex flex-col gap-3 border-t border-[#E6E6E6] p-4 ps-6">
                      <SearchInput
                        value={query}
                        onChange={(v) =>
                          setClassroomSearch((prev) => ({ ...prev, [classroom.id]: v }))
                        }
                        placeholder={t('eLearning.selectStudents.studentSearchPlaceholder')}
                      />
                      {isLoading ? (
                        <p className="py-3 text-center text-sm text-[#646969]">
                          {t('common.loading')}
                        </p>
                      ) : students.length === 0 ? (
                        <p className="py-3 text-center text-sm text-[#646969]">
                          {t('common.noDataFound')}
                        </p>
                      ) : (
                        students.map((student) => (
                          <div
                            key={student.id}
                            className="flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[#DDE0E0]">
                                <CustomImage
                                  src={student.profilePicture || DefaultAvatar}
                                  fallbackSrc={DefaultAvatar}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <span className="text-sm font-normal text-[#3A3A3A]">
                                {studentName(student)}
                              </span>
                            </div>
                            <CheckBox
                              checked={selected.includes(student.id)}
                              onChange={() => toggleStudent(student.id)}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" className="flex-1" onClick={handleConfirm}>
            {t('eLearning.selectStudents.confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
