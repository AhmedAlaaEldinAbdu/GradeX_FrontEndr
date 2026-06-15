import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Card from '@/shared/components/Card';
import Button from '@/shared/components/Button';
import TextArea from '@/shared/components/TextArea';
import CustomSelect from '@/shared/components/CustomSelect';
import CustomImage from '@/shared/components/CustomImage';
import DefaultAvatar from '@gradex/assets/images/profile.png';

import {
  MOCK_GRADE_OPTIONS,
  MOCK_CLASSROOM_OPTIONS,
  type MockStudentOption,
} from '../requests.mock';
import SelectStudentsPopup from '../popups/SelectStudentsPopup';

type DirectedTo = 'all' | 'selected';

type FieldLabelProps = {
  label: string;
  required?: boolean;
};

const FieldLabel: React.FC<FieldLabelProps> = ({ label, required }) => (
  <label className="mb-2 flex items-center justify-start gap-1 text-sm font-normal text-[#3A3A3A]">
    <span>{label}</span>
    {required ? <span className="text-[#DD0417]">*</span> : null}
  </label>
);

const AddMessage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [grades, setGrades] = useState<string[]>([]);
  const [classrooms, setClassrooms] = useState<string[]>([]);
  const [directedTo, setDirectedTo] = useState<DirectedTo>('all');
  const [content, setContent] = useState('');
  const [isStudentsPopupOpen, setIsStudentsPopupOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<MockStudentOption[]>([]);

  const isSelectedValid = directedTo === 'all' || selectedStudents.length > 0;
  const isValid =
    grades.length > 0 && classrooms.length > 0 && Boolean(content.trim()) && isSelectedValid;

  // Opens the picker without committing the radio; selection is confirmed in the popup.
  const handleSelectedRadio = () => {
    setIsStudentsPopupOpen(true);
  };

  const handleConfirmStudents = (students: MockStudentOption[]) => {
    setSelectedStudents(students);
    setDirectedTo(students.length > 0 ? 'selected' : 'all');
  };

  const handleSubmit = () => {
    if (!isValid) return;
    // TODO(backend): replace with a redux thunk + requests service call.
    navigate('/requests?tab=messages');
  };

  return (
    <Card className="rounded-2xl" padding="lg">
      <div className="flex flex-col items-start gap-8">
        <div className="w-full">
          <FieldLabel label={t('requests.addMessage.gradeLabel')} required />
          <CustomSelect
            isMulti
            value={grades}
            onChange={(value) => setGrades(Array.isArray(value) ? value : [value])}
            options={MOCK_GRADE_OPTIONS}
            placeholder={t('requests.addMessage.gradePlaceholder')}
          />
        </div>

        <div className="w-full">
          <FieldLabel label={t('requests.addMessage.classroomLabel')} required />
          <CustomSelect
            isMulti
            value={classrooms}
            onChange={(value) => setClassrooms(Array.isArray(value) ? value : [value])}
            options={MOCK_CLASSROOM_OPTIONS}
            placeholder={t('requests.addMessage.classroomPlaceholder')}
          />
        </div>

        <div className="w-full">
          <FieldLabel label={t('requests.addMessage.directedToLabel')} required />
          <div className="flex items-center justify-start gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-normal text-[#646969]">
              <span>{t('requests.addMessage.allClassrooms')}</span>
              <input
                type="radio"
                name="directedTo"
                value="all"
                checked={directedTo === 'all'}
                onChange={() => setDirectedTo('all')}
                className="h-4 w-4 accent-[#00512E]"
              />
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-normal text-[#646969]">
              <span>{t('requests.addMessage.selectedStudents')}</span>
              <input
                type="radio"
                name="directedTo"
                value="selected"
                checked={directedTo === 'selected'}
                onChange={handleSelectedRadio}
                className="h-4 w-4 accent-[#00512E]"
              />
            </label>
          </div>

          {directedTo === 'selected' && selectedStudents.length > 0 ? (
            <button
              type="button"
              onClick={() => setIsStudentsPopupOpen(true)}
              className="mt-4 flex items-center gap-3"
            >
              <CustomImage
                src={selectedStudents[0].avatarPath || DefaultAvatar}
                fallbackSrc={DefaultAvatar}
                alt={selectedStudents[0].name}
                className="h-11 w-11 rounded-lg border border-[#DDE0E0] object-cover"
              />
              <span className="text-base font-medium text-[#00512E]">
                {selectedStudents[0].name}
                {selectedStudents.length > 1
                  ? ` ${t('requests.addMessage.studentsSummary', {
                      count: selectedStudents.length - 1,
                    })}`
                  : ''}
              </span>
            </button>
          ) : null}
        </div>

        <div className="w-full">
          <FieldLabel label={t('requests.addMessage.contentLabel')} required />
          <TextArea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={t('requests.addMessage.contentPlaceholder')}
          />
        </div>

        <div className="flex w-full items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/requests?tab=messages')}
          >
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!isValid}>
            {t('requests.addMessage.next')}
          </Button>
        </div>
      </div>

      <SelectStudentsPopup
        isOpen={isStudentsPopupOpen}
        onClose={() => setIsStudentsPopupOpen(false)}
        selectedIds={selectedStudents.map((student) => student.id)}
        onConfirm={handleConfirmStudents}
      />
    </Card>
  );
};

export default AddMessage;
