import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import CustomSelect from '@/shared/components/CustomSelect';
import FileUpload from '@/shared/components/FileUpload';
import SearchInput from '@/shared/components/SearchInput';
import Badge from '@/shared/components/Badge';
import CustomImage from '@/shared/components/CustomImage';
import PlusIcon from '@gradex/assets/icons/Plus.svg';
import TrashFillIcon from '@gradex/assets/icons/TrashFill.svg';
import DocumentEditOutlineIcon from '@gradex/assets/icons/DocumentEditOutline.svg';
import ClockIcon from '@gradex/assets/icons/Clock.svg';

export type Lecture = { id: string; nameAr: string; nameEn: string; duration: string };

export type LecturesData = {
  source: 'manual' | 'platform';
  items: Lecture[];
  selectedCourseId: string;
};

const newLecture = (): Lecture => ({
  id: `lec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  nameAr: '',
  nameEn: '',
  duration: '',
});

export const INITIAL_LECTURES_DATA: LecturesData = {
  source: 'manual',
  items: [newLecture()],
  selectedCourseId: '',
};

const FILE_FORMATS = [
  'GIF',
  'SVG',
  'JPG',
  'PNG',
  'PDF',
  'DOC',
  'DOCX',
  'XLS',
  'XLSX',
  'TXT',
  'PPT',
  'PPTX',
];
const FILE_ACCEPT = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.ppt,.pptx';

const DURATION_OPTIONS = ['15', '30', '45', '60'].map((v) => ({ value: v, label: v }));

type PlatformCourse = {
  id: string;
  lectures: number;
  avgMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
};

const DIFFICULTY_VARIANT: Record<PlatformCourse['difficulty'], 'success' | 'warning' | 'danger'> = {
  easy: 'success',
  medium: 'warning',
  hard: 'danger',
};

const PLATFORM_COURSES: PlatformCourse[] = [
  { id: 'p1', lectures: 24, avgMinutes: 30, difficulty: 'easy' },
  { id: 'p2', lectures: 24, avgMinutes: 30, difficulty: 'medium' },
  { id: 'p3', lectures: 24, avgMinutes: 30, difficulty: 'hard' },
];

type CourseLecturesStepProps = {
  data: LecturesData;
  onChange: (data: LecturesData) => void;
};

export default function CourseLecturesStep({ data, onChange }: CourseLecturesStepProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [lecturesCount, setLecturesCount] = useState('');
  const [level, setLevel] = useState('');

  const set = (partial: Partial<LecturesData>) => onChange({ ...data, ...partial });

  const updateLecture = (id: string, partial: Partial<Lecture>) =>
    set({ items: data.items.map((lec) => (lec.id === id ? { ...lec, ...partial } : lec)) });

  const addLecture = () => set({ items: [...data.items, newLecture()] });

  const removeLecture = (id: string) => {
    if (data.items.length <= 1) return;
    set({ items: data.items.filter((lec) => lec.id !== id) });
  };

  const platformTitle = t('eLearning.courses.add.samples.platformTitle');
  const platformDescription = t('eLearning.courses.add.samples.platformDescription');

  const filteredCourses = PLATFORM_COURSES.filter(
    (course) =>
      (!search || platformTitle.includes(search)) && (!level || course.difficulty === level)
  );

  const lecturesCountOptions = ['12', '24', '36'].map((v) => ({ value: v, label: v }));
  const levelOptions = (['easy', 'medium', 'hard'] as const).map((v) => ({
    value: v,
    label: t(`eLearning.onlineExams.difficulty.${v}`),
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* Content source */}
      <FormField label={t('eLearning.courses.add.lectures.source')} required>
        <div className="flex items-center gap-8 pt-1">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="contentSource"
              value="manual"
              checked={data.source === 'manual'}
              onChange={() => set({ source: 'manual' })}
              className="h-4 w-4 accent-green-500"
            />
            <span className="text-base font-normal text-black-800">
              {t('eLearning.courses.add.lectures.manual')}
            </span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="contentSource"
              value="platform"
              checked={data.source === 'platform'}
              onChange={() => set({ source: 'platform' })}
              className="h-4 w-4 accent-green-500"
            />
            <span className="text-base font-normal text-black-800">
              {t('eLearning.courses.add.lectures.platform')}
            </span>
          </label>
        </div>
      </FormField>

      {/* Manual lectures */}
      {data.source === 'manual' && (
        <div className="flex flex-col gap-4">
          <p className="required text-base font-normal text-black-800">
            {t('eLearning.courses.add.lectures.section')}
          </p>

          {data.items.map((lecture) => (
            <div key={lecture.id} className="flex items-start gap-3">
              <div className="relative flex-1 rounded-3xl border border-[#E6E6E6] p-5">
                {/* Remove lecture */}
                {data.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLecture(lecture.id)}
                    aria-label={t('common.delete')}
                    className="absolute end-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-red-50"
                  >
                    <CustomImage src={TrashFillIcon} alt="" className="h-5 w-5" />
                  </button>
                )}

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 pt-2 md:grid-cols-2">
                  <FormField label={t('eLearning.courses.add.lectures.nameAr')} required>
                    <Input
                      value={lecture.nameAr}
                      onChange={(e) => updateLecture(lecture.id, { nameAr: e.target.value })}
                      placeholder={t('eLearning.courses.add.lectures.nameArPlaceholder')}
                    />
                  </FormField>
                  <FormField label={t('eLearning.courses.add.lectures.nameEn')} required>
                    <Input
                      value={lecture.nameEn}
                      onChange={(e) => updateLecture(lecture.id, { nameEn: e.target.value })}
                      placeholder={t('eLearning.courses.add.lectures.nameEnPlaceholder')}
                    />
                  </FormField>
                </div>

                <div className="mt-5">
                  <FormField label={t('eLearning.courses.add.lectures.duration')} optional>
                    <CustomSelect
                      value={lecture.duration}
                      onChange={(v) => updateLecture(lecture.id, { duration: v as string })}
                      options={DURATION_OPTIONS}
                      placeholder={t('eLearning.courses.add.lectures.durationPlaceholder')}
                      showSearch={false}
                    />
                  </FormField>
                </div>

                <div className="mt-5">
                  <FileUpload
                    id={`lecture-video-${lecture.id}`}
                    label={t('eLearning.courses.add.lectures.video')}
                    required
                    uploadText={t('eLearning.courses.add.uploadText')}
                    formatHints={FILE_FORMATS}
                    accept={FILE_ACCEPT}
                  />
                </div>

                <div className="mt-5">
                  <FileUpload
                    id={`lecture-attachments-${lecture.id}`}
                    label={t('eLearning.courses.add.lectures.attachments')}
                    optional
                    multiple
                    uploadText={t('eLearning.courses.add.uploadText')}
                    formatHints={FILE_FORMATS}
                    accept={FILE_ACCEPT}
                  />
                </div>
              </div>

              {/* Add another lecture */}
              <button
                type="button"
                onClick={addLecture}
                aria-label={t('common.add')}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500 transition-colors hover:bg-green-800"
              >
                <CustomImage src={PlusIcon} alt="" className="h-6 w-6" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Platform courses */}
      {data.source === 'platform' && (
        <div className="flex flex-col gap-4">
          <p className="required text-base font-normal text-black-800">
            {t('eLearning.courses.add.lectures.section')}
          </p>

          <div className="flex flex-col gap-4 rounded-3xl border border-[#E6E6E6] p-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center justify-end gap-4">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder={t('eLearning.courses.add.lectures.searchPlaceholder')}
                wrapperClassName="min-w-[220px] flex-1"
              />
              <CustomSelect
                value={lecturesCount}
                onChange={(v) => setLecturesCount(v as string)}
                options={lecturesCountOptions}
                placeholder={t('eLearning.courses.add.lectures.lecturesCount')}
                showSearch={false}
                className="min-w-[150px]"
              />
              <CustomSelect
                value={level}
                onChange={(v) => setLevel(v as string)}
                options={levelOptions}
                placeholder={t('eLearning.courses.add.lectures.level')}
                showSearch={false}
                className="min-w-[150px]"
              />
            </div>

            {/* Selectable course cards */}
            <div className="flex flex-col gap-4">
              {filteredCourses.map((course) => {
                const isSelected = data.selectedCourseId === course.id;
                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => set({ selectedCourseId: course.id })}
                    className={`flex items-start gap-4 rounded-3xl border p-4 text-start transition-colors ${
                      isSelected ? 'border-green-500' : 'border-[#E6E6E6] hover:border-green-200'
                    }`}
                  >
                    <div className="flex flex-1 flex-col gap-2">
                      <h4 className="text-base font-medium text-[#0E1F1F]">{platformTitle}</h4>
                      <p className="text-sm font-normal text-[#3A3A3A]">{platformDescription}</p>
                      <div className="flex items-center gap-2 text-sm font-normal text-[#646969]">
                        <CustomImage src={DocumentEditOutlineIcon} alt="" className="h-4 w-4" />
                        <span>
                          {course.lectures} {t('eLearning.courses.add.lectures.lectureUnit')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-normal text-[#646969]">
                        <CustomImage src={ClockIcon} alt="" className="h-4 w-4" />
                        <span>
                          {t('eLearning.courses.add.lectures.avgTime', {
                            minutes: course.avgMinutes,
                          })}
                        </span>
                      </div>
                    </div>

                    <Badge variant={DIFFICULTY_VARIANT[course.difficulty]}>
                      {t(`eLearning.onlineExams.difficulty.${course.difficulty}`)}
                    </Badge>

                    <span
                      className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        isSelected ? 'border-green-500' : 'border-[#DDE0E0]'
                      }`}
                    >
                      {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-green-500" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
