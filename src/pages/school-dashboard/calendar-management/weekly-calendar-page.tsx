import { useState } from 'react';
import WeeklyScheduleCalendar, {
  type ScheduleLesson,
  type ScheduleEvent,
} from '@/shared/components/WeeklyScheduleCalendar';
import CustomSelect from '@/shared/components/CustomSelect';

// Demo lessons matching the design exactly
// dayIndex = row (0=السبت, 1=الأحد, 2=الإثنين, 3=الثلاثاء, 4=الأربعاء, 5=الخميس, 6=الجمعة)
// periodIndex = column (0-8): 0=1, 1=2, 2=3, 3=فطار, 4=5, 5=الحديقة, 6=6, 7=7, 8=8
const DEMO_LESSONS: ScheduleLesson[] = [
  // ============ Row 0 (السبت - Saturday 2/8) - EMPTY ============

  // ============ Row 1 (الأحد - Sunday 3/8) ============
  {
    id: 'sun-1',
    subject: 'عربي',
    teacherName: 'أ/ أحمد حسن رجب',
    startTime: '8:30',
    endTime: '9:15',
    duration: 45,
    dayIndex: 1,
    periodIndex: 0,
    color: 'arabic',
  },
  {
    id: 'sun-2',
    subject: 'عربي',
    teacherName: 'أ/ أحمد حسن رجب',
    startTime: '9:15',
    endTime: '10:00',
    duration: 45,
    dayIndex: 1,
    periodIndex: 1,
    color: 'arabic',
  },
  {
    id: 'sun-3',
    subject: 'عربي',
    teacherName: 'أ/ أحمد حسن رجب',
    startTime: '10:00',
    endTime: '10:45',
    duration: 45,
    dayIndex: 1,
    periodIndex: 2,
    color: 'arabic',
  },
  // Column 3 = فطار (skip)
  {
    id: 'sun-4',
    subject: 'عربي',
    teacherName: 'أ/ أحمد حسن رجب',
    startTime: '11:30',
    endTime: '12:15',
    duration: 45,
    dayIndex: 1,
    periodIndex: 4,
    color: 'arabic',
  },
  // Column 5 = الحديقة (skip)
  {
    id: 'sun-5',
    subject: 'مات',
    teacherName: 'أ/ أحمد حسن رجب',
    startTime: '1:00',
    endTime: '1:45',
    duration: 45,
    dayIndex: 1,
    periodIndex: 6,
    color: 'math',
  },
  {
    id: 'sun-6',
    subject: 'علوم',
    teacherName: 'أ/ أحمد حسن رجب',
    startTime: '1:45',
    endTime: '2:30',
    duration: 45,
    dayIndex: 1,
    periodIndex: 7,
    color: 'science',
  },
  {
    id: 'sun-7',
    subject: 'علوم',
    teacherName: 'أ/ أحمد حسن رجب',
    startTime: '2:30',
    endTime: '3:15',
    duration: 45,
    dayIndex: 1,
    periodIndex: 8,
    color: 'science',
  },

  // ============ Row 2 (الإثنين - Monday 4/8) ============
  {
    id: 'mon-1',
    subject: 'مات',
    teacherName: 'أ/ أحمد حسن رجب',
    startTime: '8:30',
    endTime: '9:15',
    duration: 45,
    dayIndex: 2,
    periodIndex: 0,
    color: 'math',
  },
  {
    id: 'mon-2',
    subject: 'مات',
    teacherName: 'أ/ أحمد حسن رجب',
    startTime: '9:15',
    endTime: '10:00',
    duration: 45,
    dayIndex: 2,
    periodIndex: 1,
    color: 'math',
  },
  {
    id: 'mon-3',
    subject: 'مات',
    teacherName: 'أ/ أحمد حسن رجب',
    startTime: '10:00',
    endTime: '10:45',
    duration: 45,
    dayIndex: 2,
    periodIndex: 2,
    color: 'math',
  },
  // Column 3 = فطار (skip)
  {
    id: 'mon-4',
    subject: 'مات',
    teacherName: 'أ/ أحمد حسن رجب',
    startTime: '11:30',
    endTime: '12:15',
    duration: 45,
    dayIndex: 2,
    periodIndex: 4,
    color: 'math',
  },
  // Column 5 = الحديقة (skip)
  {
    id: 'mon-5',
    subject: 'مات',
    teacherName: 'أ/ أحمد حسن رجب',
    startTime: '1:00',
    endTime: '1:45',
    duration: 45,
    dayIndex: 2,
    periodIndex: 6,
    color: 'math',
  },
  {
    id: 'mon-6',
    subject: 'علوم',
    teacherName: 'أ/ أحمد حسن رجب',
    startTime: '1:45',
    endTime: '2:30',
    duration: 45,
    dayIndex: 2,
    periodIndex: 7,
    color: 'science',
  },
  {
    id: 'mon-7',
    subject: 'علوم',
    teacherName: 'أ/ أحمد حسن رجب',
    startTime: '2:30',
    endTime: '3:15',
    duration: 45,
    dayIndex: 2,
    periodIndex: 8,
    color: 'science',
  },

  // ============ Row 3 (الثلاثاء - Tuesday 5/8) ============
  {
    id: 'tue-1',
    subject: 'علوم',
    teacherName: 'أ/ أحمد حسن رجب',
    startTime: '8:30',
    endTime: '9:15',
    duration: 45,
    dayIndex: 3,
    periodIndex: 0,
    color: 'science',
  },
  {
    id: 'tue-2',
    subject: 'علوم',
    teacherName: 'أ/ أحمد حسن رجب',
    startTime: '9:15',
    endTime: '10:00',
    duration: 45,
    dayIndex: 3,
    periodIndex: 1,
    color: 'science',
  },
  {
    id: 'tue-3',
    subject: 'علوم',
    teacherName: 'أ/ أحمد حسن رجب',
    startTime: '10:00',
    endTime: '10:45',
    duration: 45,
    dayIndex: 3,
    periodIndex: 2,
    color: 'science',
  },

  // ============ Row 4 (الأربعاء - Wednesday 6/8) ============
  {
    id: 'wed-1',
    subject: 'علوم',
    teacherName: 'أ/ أحمد حسن رجب',
    startTime: '8:30',
    endTime: '9:15',
    duration: 45,
    dayIndex: 4,
    periodIndex: 0,
    color: 'science',
  },
  {
    id: 'wed-2',
    subject: 'علوم',
    teacherName: 'أ/ أحمد حسن رجب',
    startTime: '9:15',
    endTime: '10:00',
    duration: 45,
    dayIndex: 4,
    periodIndex: 1,
    color: 'science',
  },

  // ============ Row 5 (الخميس - Thursday 7/8) ============
  {
    id: 'thu-1',
    subject: 'خارجي',
    teacherName: 'أ/ أحمد حسن رجب',
    startTime: '8:30',
    endTime: '9:15',
    duration: 45,
    dayIndex: 5,
    periodIndex: 0,
    color: 'english',
  },
  {
    id: 'thu-2',
    subject: 'علوم',
    teacherName: 'أ/ أحمد حسن رجب',
    startTime: '10:00',
    endTime: '10:45',
    duration: 45,
    dayIndex: 5,
    periodIndex: 2,
    color: 'science',
  },

  // ============ Row 6 (الجمعة - Friday 8/8) - EMPTY ============
];

// Demo events matching the design (colored blocks for special activities)
const DEMO_EVENTS: ScheduleEvent[] = [
  // فان داي (green) with arrow - Row 3 (الثلاثاء), column 0
  {
    id: 'e-funday',
    title: 'فان داي',
    dayIndex: 3,
    startPeriod: 0,
    endPeriod: 0,
    color: 'green',
    hasArrow: true,
  },
  // تصوير الطلاب (teal) with arrow - Row 5 (الخميس), columns 5-6
  {
    id: 'e-photo',
    title: 'تصوير الطلاب',
    dayIndex: 5,
    startPeriod: 5,
    endPeriod: 6,
    color: 'teal',
    hasArrow: true,
  },
];

export default function WeeklyCalendarPage() {
  const [educationSystem, setEducationSystem] = useState('');
  const [systemType, setSystemType] = useState('global');
  const [stage, setStage] = useState('');
  const [stageValue, setStageValue] = useState('1');
  const [grade, setGrade] = useState('');
  const [division, setDivision] = useState('1');

  const educationSystemOptions = [
    { value: 'global', label: 'عالمي' },
    { value: 'national', label: 'وطني' },
  ];

  const systemTypeOptions = [{ value: 'global', label: 'عالمي' }];

  const stageOptions = [
    { value: '', label: 'اختر المرحلة' },
    { value: '1', label: 'الأول الأعدادي' },
    { value: '2', label: 'الثاني الأعدادي' },
    { value: '3', label: 'الثالث الأعدادي' },
  ];

  const stageValueOptions = [
    { value: '1', label: 'الأول الأعدادي' },
    { value: '2', label: 'الثاني الأعدادي' },
    { value: '3', label: 'الثالث الأعدادي' },
  ];

  const gradeOptions = [
    { value: '', label: 'الصف الدراسي' },
    { value: '1', label: 'الصف الأول' },
    { value: '2', label: 'الصف الثاني' },
  ];

  const divisionOptions = [
    { value: '1', label: '1/1 ع' },
    { value: '2', label: '1/2 ع' },
    { value: '3', label: '1/3 ع' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/80 p-4 md:p-6" dir="rtl">
      {/* Header Row: Title on right, Button on left */}
      <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <h1 className="text-xl font-bold text-gray-800 md:text-2xl">التقويم الاسبوعي</h1>
        <button className="flex items-center gap-2 rounded-full border-2 border-emerald-600 bg-white px-5 py-2 text-sm font-semibold text-emerald-600 transition-all hover:bg-emerald-50 active:scale-95">
          إسترجاع الحصص بالتساوي
        </button>
      </div>

      {/* Filters Row - matching design order from right to left */}
      <div className="mb-4 flex flex-wrap items-center justify-start gap-3">
        {/* اختر النظام التعليم */}
        <div className="min-w-[160px]">
          <CustomSelect
            value={educationSystem}
            onChange={(val) => setEducationSystem(val as string)}
            options={educationSystemOptions}
            placeholder="اختر النظام التعليم"
          />
        </div>

        {/* عالمي */}
        <div className="min-w-[100px]">
          <CustomSelect
            value={systemType}
            onChange={(val) => setSystemType(val as string)}
            options={systemTypeOptions}
            placeholder="عالمي"
          />
        </div>

        {/* اختر المرحلة */}
        <div className="min-w-[130px]">
          <CustomSelect
            value={stage}
            onChange={(val) => setStage(val as string)}
            options={stageOptions}
            placeholder="اختر المرحلة"
          />
        </div>

        {/* الأول الأعدادي */}
        <div className="min-w-[130px]">
          <CustomSelect
            value={stageValue}
            onChange={(val) => setStageValue(val as string)}
            options={stageValueOptions}
            placeholder="الأول الأعدادي"
          />
        </div>

        {/* الصف الدراسي */}
        <div className="min-w-[120px]">
          <CustomSelect
            value={grade}
            onChange={(val) => setGrade(val as string)}
            options={gradeOptions}
            placeholder="الصف الدراسي"
          />
        </div>

        {/* 1/1 ع */}
        <div className="min-w-[90px]">
          <CustomSelect
            value={division}
            onChange={(val) => setDivision(val as string)}
            options={divisionOptions}
            placeholder="1/1 ع"
          />
        </div>
      </div>

      {/* Calendar Component */}
      <div className="rounded-xl bg-white shadow-sm">
        <WeeklyScheduleCalendar
          lessons={DEMO_LESSONS}
          events={DEMO_EVENTS}
          onLessonClick={(lesson) => console.log('Lesson clicked:', lesson)}
          onDotsClick={(lesson) => console.log('Dots clicked:', lesson)}
          onDayMenuClick={(dayIndex) => console.log('Day menu clicked:', dayIndex)}
        />
      </div>
    </div>
  );
}
