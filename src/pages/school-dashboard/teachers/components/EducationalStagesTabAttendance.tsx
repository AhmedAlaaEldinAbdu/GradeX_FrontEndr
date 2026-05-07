import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Loading from '@/shared/components/Loading';
import { teacherApiService } from '@/services/api/teachers/teachers.service';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import type {
  TeacherAssignmentListItem,
  TeacherAssignmentBook,
  TeacherAssignmentListClassroom,
} from '@/types/teacherAssignment';

interface EducationalStagesTabAttendanceProps {
  teacherId: string;
  isActive?: boolean;
}

interface MaterialBookEntry {
  materialId: string;
  materialName: string;
  books: TeacherAssignmentBook[];
}

interface GroupedGradeAssignment {
  gradeId: string;
  gradeName: string;
  materialBooks: MaterialBookEntry[];
  classrooms: TeacherAssignmentListClassroom[];
}

export default function EducationalStagesTabAttendance({
  teacherId,
  isActive = true,
}: EducationalStagesTabAttendanceProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';
  const schoolBranchId = getCurrentSchoolBranchId();

  const [assignments, setAssignments] = useState<TeacherAssignmentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teacherId || !isActive || !schoolBranchId) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    teacherApiService
      .getTeacherAssignmentList({ TeacherId: teacherId, SchoolBranchesId: schoolBranchId })
      .then((data) => {
        if (cancelled) return;
        setAssignments(data?.teacherAssignmentDto ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        setError(t('common.errorOccurred'));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [teacherId, isActive, schoolBranchId, t]);

  const getGradeName = (item: TeacherAssignmentListItem) =>
    currentLang === 'ar' ? item.gradeNameAR : item.gradeNameEN || item.gradeNameAR;
  const getMaterialName = (item: TeacherAssignmentListItem) =>
    currentLang === 'ar' ? item.materialNameAR : item.materialNameEN || item.materialNameAR;
  const getClassroomName = (c: TeacherAssignmentListClassroom) =>
    currentLang === 'ar' ? c.nameAR : c.nameEN || c.nameAR;

  const getOrdinal = (num: number) => {
    const key = `teachers.details.ordinals.${num}`;
    const translated = t(key);
    return translated === key ? num.toString() : translated;
  };

  const groupedByGrade = useMemo<GroupedGradeAssignment[]>(() => {
    const map = new Map<string, GroupedGradeAssignment>();

    assignments.forEach((item) => {
      const itemBooks = [...(item.books ?? [])];
      const itemClassrooms = [...(item.classrooms ?? [])];
      const existing = map.get(item.gradeId);

      if (existing) {
        const existingMaterial = existing.materialBooks.find(
          (m) => m.materialId === item.materialId
        );
        if (existingMaterial) {
          existingMaterial.books.push(...itemBooks);
        } else {
          existing.materialBooks.push({
            materialId: item.materialId,
            materialName: getMaterialName(item),
            books: itemBooks,
          });
        }
        existing.classrooms.push(...itemClassrooms);
      } else {
        map.set(item.gradeId, {
          gradeId: item.gradeId,
          gradeName: getGradeName(item),
          materialBooks: [
            {
              materialId: item.materialId,
              materialName: getMaterialName(item),
              books: itemBooks,
            },
          ],
          classrooms: itemClassrooms,
        });
      }
    });

    return Array.from(map.values());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignments, currentLang]);

  if (!isActive || isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (groupedByGrade.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl bg-white text-sm text-gray-500 shadow-[0_1px_12px_1px_rgba(0,0,0,0.06)]">
        {t('common.noResults')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedByGrade.map((grade) => {
        const materialsWithBooks = grade.materialBooks.filter((m) => m.books.length > 0);
        const allBooks = materialsWithBooks.flatMap((m) =>
          m.books.map((book) => ({ book, materialId: m.materialId }))
        );
        const showOrdinal = allBooks.length > 1;
        return (
          <div
            key={grade.gradeId}
            className="flex flex-col gap-8 rounded-2xl bg-white p-4 shadow-[0_1px_12px_1px_rgba(0,0,0,0.06)]"
          >
            {/* Subject + Grade row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-center md:gap-8">
              <div className="flex items-center gap-1 md:justify-self-start">
                <span className="text-base font-normal leading-[19px] text-[#3A3A3A]">
                  {t('teachers.details.subject')}:
                </span>
                <span className="text-sm font-normal leading-[22px] text-[#646969]">
                  {grade.materialBooks.map((m) => m.materialName).join(' - ')}
                </span>
              </div>
              <div className="flex items-center gap-1 md:justify-self-center">
                <span className="text-base font-normal leading-[19px] text-[#3A3A3A]">
                  {t('teachers.details.educationalStage')}:
                </span>
                <span className="text-sm font-normal leading-[22px] text-[#646969]">
                  {grade.gradeName}
                </span>
              </div>
            </div>

            {/* Classrooms section */}
            <div className="flex flex-col gap-3">
              <span className="text-start text-base font-normal leading-[19px] text-[#0E1F1F]">
                {t('teachers.details.classrooms')}:
              </span>
              <div className="flex flex-wrap items-start gap-x-2 gap-y-[26px]">
                {grade.classrooms.length > 0 ? (
                  grade.classrooms.map((classroom, cIdx) => (
                    <span
                      key={`${classroom.id}-${cIdx}`}
                      className="inline-flex h-[34px] items-center justify-center rounded-lg bg-[#DFF8ED] px-3 text-sm font-normal leading-[22px] text-[#3A3A3A]"
                    >
                      {getClassroomName(classroom)}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-400">{t('common.notAvailable')}</span>
                )}
              </div>
            </div>

            {/* Books section: each book in its own bordered card */}
            {allBooks.length > 0 && (
              <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-start md:gap-8">
                {allBooks.map(({ book }, idx) => (
                  <div
                    key={`${book.id}-${idx}`}
                    className="flex flex-1 flex-col gap-4 rounded-xl border border-[#DDE0E0] p-3 text-start md:min-w-80"
                  >
                    <p className="text-base font-normal leading-[19px] text-[#0E1F1F]">
                      {t('teachers.details.bookName')}
                      {showOrdinal &&
                        ` ${t('teachers.placement.details.materialPrefix')} ${getOrdinal(idx + 1)}`}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="text-base font-normal leading-[19px] text-[#3A3A3A]">
                        {t('teachers.details.bookName')}:
                      </span>
                      <span className="text-sm font-normal leading-[22px] text-[#646969]">
                        {book.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
