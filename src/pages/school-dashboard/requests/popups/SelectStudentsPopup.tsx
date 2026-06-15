import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Modal from '@/shared/popups/Modal';
import Button from '@/shared/components/Button';
import SearchInput from '@/shared/components/SearchInput';
import CustomImage from '@/shared/components/CustomImage';
import ChevronDownIcon from '@gradex/assets/icons/ChevronDown.svg';
import ChevronUpIcon from '@gradex/assets/icons/ChevronUp.svg';

import { MOCK_CLASSROOM_GROUPS, type MockStudentOption } from '../requests.mock';

interface SelectStudentsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  onConfirm: (students: MockStudentOption[]) => void;
}

const SelectStudentsPopup: React.FC<SelectStudentsPopupProps> = ({
  isOpen,
  onClose,
  selectedIds,
  onConfirm,
}) => {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [checked, setChecked] = useState<string[]>(selectedIds);

  // Re-sync local selection whenever the popup is (re)opened.
  React.useEffect(() => {
    if (isOpen) {
      setChecked(selectedIds);
      setSearch('');
      setStudentSearch({});
      setExpanded({});
    }
  }, [isOpen, selectedIds]);

  const visibleGroups = useMemo(() => {
    const term = search.trim();
    if (!term) return MOCK_CLASSROOM_GROUPS;
    return MOCK_CLASSROOM_GROUPS.filter((group) => group.name.includes(term));
  }, [search]);

  const toggleGroup = (groupId: string) => {
    setExpanded((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const toggleStudent = (studentId: string) => {
    setChecked((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleConfirm = () => {
    const allStudents = MOCK_CLASSROOM_GROUPS.flatMap((group) => group.students);
    onConfirm(allStudents.filter((student) => checked.includes(student.id)));
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
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t('requests.searchPlaceholder')}
        />

        <div className="flex max-h-[45vh] flex-col gap-3 overflow-y-auto">
          {visibleGroups.map((group) => {
            const isExpanded = Boolean(expanded[group.id]);
            const term = (studentSearch[group.id] ?? '').trim();
            const students = term
              ? group.students.filter((student) => student.name.includes(term))
              : group.students;

            return (
              <div key={group.id} className="rounded-2xl border border-[#DDE0E0]">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="flex w-full items-center justify-between gap-2 px-4 py-3.5"
                >
                  <span className="text-sm font-normal text-[#0E1F1F]">{group.name}</span>
                  <CustomImage
                    src={isExpanded ? ChevronUpIcon : ChevronDownIcon}
                    alt=""
                    className="h-4 w-4"
                  />
                </button>

                {isExpanded ? (
                  <div className="flex flex-col gap-2 px-4 pb-4">
                    <SearchInput
                      value={studentSearch[group.id] ?? ''}
                      onChange={(value) =>
                        setStudentSearch((prev) => ({ ...prev, [group.id]: value }))
                      }
                      placeholder={t('requests.addMessage.studentSearchPlaceholder')}
                    />

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
                            className="h-4 w-4 accent-[#00512E]"
                          />
                          <span>{student.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-4 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="button" variant="primary" onClick={handleConfirm}>
            {t('requests.addMessage.confirmSelection')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SelectStudentsPopup;
