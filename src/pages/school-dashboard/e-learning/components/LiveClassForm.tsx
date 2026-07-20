import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ValidationError } from 'yup';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import Card from '@/shared/components/Card';
import Button from '@/shared/components/Button';
import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import TextArea from '@/shared/components/TextArea';
import CustomSelect from '@/shared/components/CustomSelect';
import CustomImage from '@/shared/components/CustomImage';
import FileUpload from '@/shared/components/FileUpload';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { fetchSubjects } from '@/redux/features/subjects/subjectsSlice';
import { fetchTeachers } from '@/redux/features/teachers/teachersSlice';
import { fetchGrades } from '@/redux/features/grades/gradesSlice';
import { fetchClassrooms } from '@/redux/features/classrooms/classroomsSlice';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';
import { LiveClassSchema } from '@/validations/live-class-validations';
import SelectStudentsPopup, { type SelectedStudent } from '../popups/SelectStudentsPopup';
import ClockIcon from '@gradex/assets/icons/Clock.svg';
import DefaultAvatar from '@gradex/assets/images/profile.png';

type ClassType = 'inPerson' | 'remote';
type HomeworkAudience = 'all' | 'specific';

type LiveClassFormData = {
  classType: ClassType;
  fromTime: string;
  toTime: string;
  subject: string;
  teacher: string;
  stage: string;
  grade: string;
  book: string;
  classWorkFromPage: string;
  classWorkToPage: string;
  homeworkFromPage: string;
  homeworkToPage: string;
  homeworkDescAr: string;
  homeworkDescEn: string;
  sendHomeworkTo: HomeworkAudience;
  selectedStudents: SelectedStudent[];
  attachments: File[];
};

const INITIAL_DATA: LiveClassFormData = {
  classType: 'remote',
  fromTime: '',
  toTime: '',
  subject: '',
  teacher: '',
  stage: '',
  grade: '',
  book: '',
  classWorkFromPage: '',
  classWorkToPage: '',
  homeworkFromPage: '',
  homeworkToPage: '',
  homeworkDescAr: '',
  homeworkDescEn: '',
  sendHomeworkTo: 'all',
  selectedStudents: [],
  attachments: [],
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

export default function LiveClassForm() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isArabic = i18n.language === 'ar';
  const schoolBranchId = getCurrentSchoolBranchId();

  const [data, setData] = useState<LiveClassFormData>(INITIAL_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isStudentsPopupOpen, setIsStudentsPopupOpen] = useState(false);
  const scrollToFirstError = useScrollToFirstError();

  const materials = useAppSelector((s) => s.subjects.subjects);
  const teachers = useAppSelector((s) => s.teachers.teachers);
  const grades = useAppSelector((s) => s.grades.grades);
  const classrooms = useAppSelector((s) => s.classrooms.classrooms);

  useEffect(() => {
    if (!schoolBranchId) return;
    dispatch(fetchSubjects({ page: 1, limit: 100, filters: { schoolBranchesId: schoolBranchId } }));
    dispatch(fetchTeachers({ page: 1, limit: 100, filters: { schoolBranchesId: schoolBranchId } }));
    dispatch(fetchGrades(schoolBranchId));
  }, [dispatch, schoolBranchId]);

  useEffect(() => {
    if (!data.stage) return;
    dispatch(
      fetchClassrooms({
        page: 1,
        limit: 10000,
        filters: {
          gradeId: data.stage,
          ...(schoolBranchId && { schoolBranchId }),
        },
      })
    );
  }, [dispatch, schoolBranchId, data.stage]);

  const subjectOptions = useMemo(
    () => materials.map((m) => ({ value: m.id, label: m.name })),
    [materials]
  );
  const teacherOptions = useMemo(
    () => teachers.map((teacher) => ({ value: teacher.id, label: teacher.fullName })),
    [teachers]
  );
  const stageOptions = useMemo(
    () => grades.map((g) => ({ value: g.id, label: isArabic ? g.nameAr : g.nameEn })),
    [grades, isArabic]
  );
  const gradeOptions = useMemo(
    () =>
      classrooms
        .filter((c) => c.gradeId === data.stage)
        .map((c) => ({ value: c.id, label: isArabic ? c.name : c.nameEn || c.name })),
    [classrooms, data.stage, isArabic]
  );

  const selectedClassrooms = useMemo(() => {
    const option = gradeOptions.find((o) => o.value === data.grade);
    return option ? [{ id: option.value, name: option.label }] : [];
  }, [gradeOptions, data.grade]);

  const set =
    <K extends keyof LiveClassFormData>(key: K) =>
    (value: LiveClassFormData[K]) => {
      setData((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => (prev[key] ? { ...prev, [key]: '' } : prev));
    };

  const base = 'eLearning.liveClasses.add';

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.lms') },
    { label: t('eLearning.liveClasses.title'), path: '/lms/live-classes' },
    { label: t(`${base}.title`) },
  ];

  const handleCancel = () => navigate('/lms/live-classes');

  const handleSubmit = async () => {
    try {
      await LiveClassSchema.validate(data, { abortEarly: false });
      setErrors({});
      navigate('/lms/live-classes');
    } catch (error) {
      const next: Record<string, string> = {};
      if (error instanceof ValidationError) {
        error.inner.forEach((item) => {
          if (item.path && !next[item.path]) next[item.path] = item.message;
        });
      }
      setErrors(next);
      scrollToFirstError(next);
    }
  };

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title={`${base}.title`} />

      <Card>
        <div className="flex flex-col gap-6">
          {/* Class type */}
          <FormField
            label={t(`${base}.classType`)}
            required
            name="classType"
            error={errors.classType}
          >
            <div className="flex items-center gap-8 pt-1">
              {(['remote', 'inPerson'] as ClassType[]).map((type) => (
                <label key={type} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="classType"
                    value={type}
                    checked={data.classType === type}
                    onChange={() => set('classType')(type)}
                    className="h-4 w-4 accent-green-500"
                  />
                  <span className="text-base font-normal text-black-800">
                    {t(`${base}.${type}`)}
                  </span>
                </label>
              ))}
            </div>
          </FormField>

          {/* Timing + subject/teacher + stage/grade */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
            <FormField
              label={t(`${base}.fromTime`)}
              required
              name="fromTime"
              error={errors.fromTime}
            >
              <Input
                type="time"
                value={data.fromTime}
                onChange={(e) => set('fromTime')(e.target.value)}
                icon={<CustomImage src={ClockIcon} className="h-5 w-5" />}
              />
            </FormField>
            <FormField label={t(`${base}.toTime`)} required name="toTime" error={errors.toTime}>
              <Input
                type="time"
                value={data.toTime}
                onChange={(e) => set('toTime')(e.target.value)}
                icon={<CustomImage src={ClockIcon} className="h-5 w-5" />}
              />
            </FormField>

            <FormField label={t(`${base}.subject`)} required name="subject" error={errors.subject}>
              <CustomSelect
                value={data.subject}
                onChange={(v) => set('subject')(v as string)}
                options={subjectOptions}
                placeholder={t(`${base}.subjectPlaceholder`)}
                error={!!errors.subject}
              />
            </FormField>
            <FormField label={t(`${base}.teacher`)} required name="teacher" error={errors.teacher}>
              <CustomSelect
                value={data.teacher}
                onChange={(v) => set('teacher')(v as string)}
                options={teacherOptions}
                placeholder={t(`${base}.teacherPlaceholder`)}
                error={!!errors.teacher}
              />
            </FormField>

            <FormField label={t(`${base}.stage`)} required name="stage" error={errors.stage}>
              <CustomSelect
                value={data.stage}
                onChange={(v) => {
                  setData((prev) => ({
                    ...prev,
                    stage: v as string,
                    grade: '',
                    selectedStudents: [],
                  }));
                  setErrors({});
                }}
                options={stageOptions}
                placeholder={t(`${base}.stagePlaceholder`)}
                showSearch={false}
                error={!!errors.stage}
              />
            </FormField>
            <FormField label={t(`${base}.grade`)} required name="grade" error={errors.grade}>
              <CustomSelect
                value={data.grade}
                onChange={(v) => {
                  setData((prev) => ({ ...prev, grade: v as string, selectedStudents: [] }));
                  setErrors({});
                }}
                options={gradeOptions}
                placeholder={t(`${base}.gradePlaceholder`)}
                showSearch={false}
                disabled={!data.stage}
                error={!!errors.grade}
              />
            </FormField>
          </div>

          {/* Book (optional) — full width */}
          <FormField label={t(`${base}.book`)} optional name="book">
            <CustomSelect
              value={data.book}
              onChange={(v) => set('book')(v as string)}
              options={[]}
              placeholder={t(`${base}.bookPlaceholder`)}
              showSearch={false}
            />
          </FormField>

          {/* Class work */}
          <div className="rounded-2xl border border-[#DDE0E0] p-4">
            <h3 className="mb-4 text-start text-lg font-medium text-[#0E1F1F]">
              {t(`${base}.classWork`)}
            </h3>
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              <FormField label={t(`${base}.fromPage`)} optional name="classWorkFromPage">
                <Input
                  type="number"
                  min={1}
                  value={data.classWorkFromPage}
                  onChange={(e) => set('classWorkFromPage')(e.target.value)}
                  placeholder={t(`${base}.pagePlaceholder`)}
                />
              </FormField>
              <FormField label={t(`${base}.toPage`)} optional name="classWorkToPage">
                <Input
                  type="number"
                  min={1}
                  value={data.classWorkToPage}
                  onChange={(e) => set('classWorkToPage')(e.target.value)}
                  placeholder={t(`${base}.pagePlaceholder`)}
                />
              </FormField>
            </div>
          </div>

          {/* Homework */}
          <div className="rounded-2xl border border-[#DDE0E0] p-4">
            <h3 className="mb-4 text-start text-lg font-medium text-[#0E1F1F]">
              {t(`${base}.homework`)}
            </h3>
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              <FormField label={t(`${base}.fromPage`)} optional name="homeworkFromPage">
                <Input
                  type="number"
                  min={1}
                  value={data.homeworkFromPage}
                  onChange={(e) => set('homeworkFromPage')(e.target.value)}
                  placeholder={t(`${base}.pagePlaceholder`)}
                />
              </FormField>
              <FormField label={t(`${base}.toPage`)} optional name="homeworkToPage">
                <Input
                  type="number"
                  min={1}
                  value={data.homeworkToPage}
                  onChange={(e) => set('homeworkToPage')(e.target.value)}
                  placeholder={t(`${base}.pagePlaceholder`)}
                />
              </FormField>

              <FormField label={t(`${base}.descAr`)} optional name="homeworkDescAr">
                <TextArea
                  value={data.homeworkDescAr}
                  onChange={(e) => set('homeworkDescAr')(e.target.value)}
                  placeholder={t(`${base}.descPlaceholder`)}
                />
              </FormField>
              <FormField label={t(`${base}.descEn`)} optional name="homeworkDescEn">
                <TextArea
                  value={data.homeworkDescEn}
                  onChange={(e) => set('homeworkDescEn')(e.target.value)}
                  placeholder={t(`${base}.descPlaceholder`)}
                />
              </FormField>
            </div>

            <FormField
              label={t(`${base}.sendHomeworkTo`)}
              required
              name="sendHomeworkTo"
              error={errors.sendHomeworkTo || errors.selectedStudents}
            >
              <div className="flex items-center gap-8 pt-1">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="sendHomeworkTo"
                    value="all"
                    checked={data.sendHomeworkTo === 'all'}
                    onChange={() => {
                      setData((prev) => ({ ...prev, sendHomeworkTo: 'all', selectedStudents: [] }));
                      setErrors({});
                    }}
                    className="h-4 w-4 accent-green-500"
                  />
                  <span className="text-base font-normal text-black-800">{t(`${base}.all`)}</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="sendHomeworkTo"
                    value="specific"
                    checked={data.sendHomeworkTo === 'specific'}
                    onChange={() => {
                      set('sendHomeworkTo')('specific');
                      setIsStudentsPopupOpen(true);
                    }}
                    className="h-4 w-4 accent-green-500"
                  />
                  <span className="text-base font-normal text-black-800">
                    {t(`${base}.specificStudents`)}
                  </span>
                </label>
              </div>
            </FormField>

            {/* Selected students summary — first student + remaining count. */}
            {data.sendHomeworkTo === 'specific' && data.selectedStudents.length > 0 && (
              <button
                type="button"
                onClick={() => setIsStudentsPopupOpen(true)}
                className="mt-3 flex items-center gap-3 self-start text-start"
              >
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[#DDE0E0]">
                  <CustomImage
                    src={data.selectedStudents[0].avatar || DefaultAvatar}
                    fallbackSrc={DefaultAvatar}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="text-sm font-normal text-[#3A3A3A]">
                  {data.selectedStudents[0].name}
                </span>
                {data.selectedStudents.length > 1 && (
                  <span className="text-sm font-bold text-green-500">
                    +{data.selectedStudents.length - 1}
                  </span>
                )}
              </button>
            )}

            {data.sendHomeworkTo === 'specific' && data.selectedStudents.length === 0 && (
              <div className="flex">
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3"
                  onClick={() => setIsStudentsPopupOpen(true)}
                >
                  {t(`${base}.selectStudentsButton`)}
                </Button>
              </div>
            )}
          </div>

          {/* Attachments (optional) */}
          <FileUpload
            id="live-class-attachments"
            label={t(`${base}.attachments`)}
            optional
            multiple
            uploadText={t(`${base}.uploadText`)}
            formatHints={FILE_FORMATS}
            accept={FILE_ACCEPT}
            maxSize={10}
            onFilesChange={(files) => set('attachments')(files)}
          />

          {/* Footer — pinned to the end (left in RTL) with the primary action last,
              matching the design and the CourseForm pattern. */}
          <div className="mt-2 flex items-center justify-end gap-3">
            <Button variant="outline" onClick={handleCancel}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={() => void handleSubmit()}>
              {t('common.add')}
            </Button>
          </div>
        </div>
      </Card>

      <SelectStudentsPopup
        isOpen={isStudentsPopupOpen}
        onClose={() => setIsStudentsPopupOpen(false)}
        classrooms={selectedClassrooms}
        value={data.selectedStudents.map((s) => s.id)}
        onConfirm={(students) => set('selectedStudents')(students)}
      />
    </div>
  );
}
