import { useTranslation } from 'react-i18next';
import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import CustomSelect from '@/shared/components/CustomSelect';
import FileUpload from '@/shared/components/FileUpload';
import CustomImage from '@/shared/components/CustomImage';
import GreenPlusIcon from '@gradex/assets/icons/GreenPlus.svg';
import TrashFillIcon from '@gradex/assets/icons/TrashFill.svg';

export type Lecture = {
  id: string;
  nameAr: string;
  nameEn: string;
  duration: string;
  video: File | null;
  attachments: File[];
  /** Existing video shown in edit mode (server-relative URL + name). */
  videoUrl?: string;
  videoName?: string;
  /** Existing attachments shown in edit mode. */
  existingAttachments?: { fileName: string; fileUrl: string }[];
};

export type LecturesData = {
  source: 'manual';
  items: Lecture[];
  selectedCourseId: string;
};

const newLecture = (): Lecture => ({
  id: `lec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  nameAr: '',
  nameEn: '',
  duration: '',
  video: null,
  attachments: [],
});

export const INITIAL_LECTURES_DATA: LecturesData = {
  source: 'manual',
  items: [newLecture()],
  selectedCourseId: '',
};

// File and image formats for attachments
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

// Video formats
const VIDEO_FORMATS = ['MP4', 'AVI', 'MOV', 'MKV', 'WEBM', 'FLV', 'WMV'];
const VIDEO_ACCEPT = 'video/*,.mp4,.avi,.mov,.mkv,.webm,.flv,.wmv';

const DURATION_VALUES = ['15', '30', '45', '60'];

/** Duration options that always include the lecture's current value (e.g. an edit value). */
const buildDurationOptions = (current: string) => {
  const values =
    current && !DURATION_VALUES.includes(current)
      ? [...DURATION_VALUES, current].sort((a, b) => Number(a) - Number(b))
      : DURATION_VALUES;
  return values.map((v) => ({ value: v, label: v }));
};

type CourseLecturesStepProps = {
  data: LecturesData;
  onChange: (data: LecturesData) => void;
  errors?: {
    items?: Array<Partial<Record<keyof Lecture, string>>>;
  };
};

export default function CourseLecturesStep({
  data,
  onChange,
  errors = {},
}: CourseLecturesStepProps) {
  const { t } = useTranslation();

  const set = (partial: Partial<LecturesData>) => onChange({ ...data, ...partial });

  const updateLecture = (id: string, partial: Partial<Lecture>) =>
    set({ items: data.items.map((lec) => (lec.id === id ? { ...lec, ...partial } : lec)) });

  const addLecture = () => set({ items: [...data.items, newLecture()] });

  const removeLecture = (id: string) => {
    if (data.items.length <= 1) return;
    set({ items: data.items.filter((lec) => lec.id !== id) });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <p className="required flex text-base font-normal text-black-800">
          {t('eLearning.courses.add.lectures.section')}
        </p>

        {data.items.map((lecture, index) => {
          const lectureErrors = errors.items?.[index] ?? {};

          return (
            <div key={lecture.id} className="flex items-start gap-3">
              <div className="relative flex-1 rounded-3xl border border-black-100 p-5">
                {data.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLecture(lecture.id)}
                    aria-label={t('common.delete')}
                    className="absolute inset-e-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-red-50"
                  >
                    <CustomImage src={TrashFillIcon} alt="" className="h-5 w-5" />
                  </button>
                )}

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 pt-2 md:grid-cols-2">
                  <FormField
                    label={t('eLearning.courses.add.lectures.nameAr')}
                    required
                    name={`items.${index}.nameAr`}
                    error={lectureErrors.nameAr}
                  >
                    <Input
                      value={lecture.nameAr}
                      onChange={(e) => updateLecture(lecture.id, { nameAr: e.target.value })}
                      placeholder={t('eLearning.courses.add.lectures.nameArPlaceholder')}
                    />
                  </FormField>
                  <FormField
                    label={t('eLearning.courses.add.lectures.nameEn')}
                    required
                    name={`items.${index}.nameEn`}
                    error={lectureErrors.nameEn}
                  >
                    <Input
                      value={lecture.nameEn}
                      onChange={(e) => updateLecture(lecture.id, { nameEn: e.target.value })}
                      placeholder={t('eLearning.courses.add.lectures.nameEnPlaceholder')}
                    />
                  </FormField>
                </div>

                <div className="mt-5">
                  <FormField
                    label={t('eLearning.courses.add.lectures.duration')}
                    optional
                    name={`items.${index}.duration`}
                    error={lectureErrors.duration}
                  >
                    <CustomSelect
                      value={lecture.duration}
                      onChange={(v) => updateLecture(lecture.id, { duration: v as string })}
                      options={buildDurationOptions(lecture.duration)}
                      placeholder={t('eLearning.courses.add.lectures.durationPlaceholder')}
                      showSearch={false}
                      error={!!lectureErrors.duration}
                    />
                  </FormField>
                </div>

                <div className="mt-5" data-form-field={`items.${index}.video`}>
                  <FileUpload
                    id={`lecture-video-${lecture.id}`}
                    label={t('eLearning.courses.add.lectures.video')}
                    required
                    uploadText={t('eLearning.courses.add.uploadText')}
                    formatHints={VIDEO_FORMATS}
                    accept={VIDEO_ACCEPT}
                    maxSize={10}
                    fileName={lecture.videoName}
                    fileUrl={lecture.videoUrl}
                    error={!!lectureErrors.video}
                    onChange={(e) =>
                      updateLecture(lecture.id, { video: e.target.files?.[0] ?? null })
                    }
                    onDelete={() =>
                      updateLecture(lecture.id, {
                        video: null,
                        videoUrl: undefined,
                        videoName: undefined,
                      })
                    }
                  />
                  {lectureErrors.video && (
                    <p className="mt-1 text-start text-sm text-red-500">{t(lectureErrors.video)}</p>
                  )}
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
                    maxSize={10}
                    attachments={lecture.existingAttachments?.map((a) => ({
                      fileName: a.fileName,
                      filePath: a.fileUrl,
                    }))}
                    onFilesChange={(files) => updateLecture(lecture.id, { attachments: files })}
                  />
                </div>
              </div>

              <CustomImage
                onClick={addLecture}
                src={GreenPlusIcon}
                alt={t('common.add')}
                className="h-8 w-8 cursor-pointer"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
