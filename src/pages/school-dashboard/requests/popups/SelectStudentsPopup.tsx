import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Modal from '@/shared/popups/Modal';
import Button from '@/shared/components/Button';
import Loading from '@/shared/components/Loading';
import SearchInput from '@/shared/components/SearchInput';
import CustomImage from '@/shared/components/CustomImage';
import { studentsApiService } from '@/services/api/students/students.service';
import type { StudentDto } from '@/services/api/types/students.types';
import ChevronDownIcon from '@gradex/assets/icons/ChevronDown.svg';
import ChevronUpIcon from '@gradex/assets/icons/ChevronUp.svg';
import DefaultAvatar from '@gradex/assets/images/profile.png';

import { type MockStudentOption } from '../requests.mock';

export type ClassroomOption = { id: string; name: string };

interface SelectStudentsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  classrooms: ClassroomOption[];
  isLoading?: boolean;
  selectedIds: string[];
  onConfirm: (students: MockStudentOption[]) => void;
}

const studentName = (student: StudentDto): string =>
  [student.firstName, student.secondName, student.thirdName, student.fourthName]
    .filter(Boolean)
    .join(' ') || student.name;

const SelectStudentsPopup: React.FC<SelectStudentsPopupProps> = ({
  isOpen,
  onClose,
  classrooms,
  isLoading = false,
  selectedIds,
  onConfirm,
}) => {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [checked, setChecked] = useState<string[]>(selectedIds);
  const [studentsByClassroom, setStudentsByClassroom] = useState<Record<string, StudentDto[]>>({});
  const [loadingClassroom, setLoadingClassroom] = useState<Record<string, boolean>>({});
  const fetchedRef = useRef<Set<string>>(new Set());

  // Re-sync local selection whenever the popup is (re)opened.
  useEffect(() => {
    if (isOpen) {
      setChecked(selectedIds);
      setSearch('');
      setStudentSearch({});
    } else {
      fetchedRef.current = new Set();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isOpen) return;
    setExpanded(Object.fromEntries(classrooms.map((classroom) => [classroom.id, true])));
  }, [isOpen, classrooms]);

  useEffect(() => {
    if (!isOpen) return;
    classrooms.forEach((classroom) => {
      if (fetchedRef.current.has(classroom.id)) return;
      fetchedRef.current.add(classroom.id);
      setLoadingClassroom((prev) => ({ ...prev, [classroom.id]: true }));
      studentsApiService
        .getStudentsByClassroomId(classroom.id, '')
        .then((students) =>
          setStudentsByClassroom((prev) => ({ ...prev, [classroom.id]: students }))
        )
        .catch(() => setStudentsByClassroom((prev) => ({ ...prev, [classroom.id]: [] })))
        .finally(() => setLoadingClassroom((prev) => ({ ...prev, [classroom.id]: false })));
    });
  }, [isOpen, classrooms]);

  const visibleClassrooms = useMemo(() => {
    const term = search.trim();
    if (!term) return classrooms;
    return classrooms.filter((classroom) => classroom.name.includes(term));
  }, [classrooms, search]);

  const toggleGroup = (classroomId: string) => {
    setExpanded((prev) => ({ ...prev, [classroomId]: !prev[classroomId] }));
  };

  const toggleStudent = (studentId: string) => {
    setChecked((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const studentsById = useMemo(() => {
    const map = new Map<string, StudentDto>();
    Object.values(studentsByClassroom).forEach((list) =>
      list.forEach((student) => map.set(student.id, student))
    );
    return map;
  }, [studentsByClassroom]);

  const handleConfirm = () => {
    const picked: MockStudentOption[] = checked.map((id) => {
      const student = studentsById.get(id);
      return {
        id,
        name: student ? studentName(student) : '',
        avatarPath: student?.profilePicture ?? null,
      };
    });
    onConfirm(picked);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('requests.addMessage.selectStudentsTitle')}
      size="md"
    >
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Loading />
          </div>
        ) : (
          <>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={t('requests.searchPlaceholder')}
            />

            <div className="flex max-h-[45vh] flex-col gap-3 overflow-y-auto">
              {visibleClassrooms.length === 0 ? (
                <p className="py-6 text-center text-sm font-normal text-[#646969]">
                  {t('common.noDataFound')}
                </p>
              ) : (
                visibleClassrooms.map((classroom) => {
                  const isExpanded = Boolean(expanded[classroom.id]);
                  const term = (studentSearch[classroom.id] ?? '').trim();
                  const all = studentsByClassroom[classroom.id] ?? [];
                  const students = term
                    ? all.filter((student) => studentName(student).includes(term))
                    : all;
                  const isLoading = loadingClassroom[classroom.id];

                  return (
                    <div key={classroom.id} className="rounded-2xl border border-[#DDE0E0]">
                      <button
                        type="button"
                        onClick={() => toggleGroup(classroom.id)}
                        className="flex w-full items-center justify-between gap-2 px-4 py-3.5"
                      >
                        <span className="text-sm font-normal text-black-900">{classroom.name}</span>
                        <CustomImage
                          src={isExpanded ? ChevronUpIcon : ChevronDownIcon}
                          alt=""
                          className="h-4 w-4"
                        />
                      </button>

                      {isExpanded ? (
                        <div className="flex flex-col gap-2 px-4 pb-4">
                          <SearchInput
                            value={studentSearch[classroom.id] ?? ''}
                            onChange={(value) =>
                              setStudentSearch((prev) => ({ ...prev, [classroom.id]: value }))
                            }
                            placeholder={t('requests.addMessage.studentSearchPlaceholder')}
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
                            <div className="flex flex-col">
                              {students.map((student) => (
                                <label
                                  key={student.id}
                                  className="flex cursor-pointer items-center justify-start gap-2 py-2 text-sm font-normal text-[#646969]"
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked.includes(student.id)}
                                    onChange={() => toggleStudent(student.id)}
                                    className="h-4 w-4 accent-green-500"
                                  />
                                  <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-[#DDE0E0]">
                                    <CustomImage
                                      src={student.profilePicture || DefaultAvatar}
                                      fallbackSrc={DefaultAvatar}
                                      alt=""
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <span>{studentName(student)}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-end gap-4 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button type="button" variant="primary" onClick={handleConfirm}>
                {t('requests.addMessage.confirmSelection')}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default SelectStudentsPopup;
