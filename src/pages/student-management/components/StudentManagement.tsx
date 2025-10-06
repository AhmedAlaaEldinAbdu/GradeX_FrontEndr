import { useState } from "react";
import Card from "../../../shared/components/Card";
import EmptyState from "../../../shared/components/EmptyState";
import Table from "../../../shared/components/Table";
import { useTranslation } from "react-i18next";
import StudentIcon from "@gradex/assets/images/icons/Student.svg";
import TrashIcon from "@gradex/assets/images/icons/Trash.svg";
import EditIcon from "@gradex/assets/images/icons/Edit.svg";

interface Student {
  id: number;
  name: string;
  fatherName: string;
  date: string;
  grade: string;
  class: string;
}

export default function StudentManagement() {
  const { t } = useTranslation();
  const [hasStudents, setHasStudents] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedCreatedBy, setSelectedCreatedBy] = useState("");
  const [selectedHistory, setSelectedHistory] = useState("");

  const students: Student[] = [
    {
      id: 1,
      name: "أحمد محمد حسن",
      fatherName: "محمد حسن",
      date: "22/2/2025",
      grade: "المرحلة الابتدائية",
      class: "1/أ",
    },
    {
      id: 2,
      name: "أحمد محمد حسن",
      fatherName: "محمد حسن",
      date: "22/2/2025",
      grade: "المرحلة الثانوية",
      class: "2/ج",
    },
    {
      id: 3,
      name: "أحمد محمد حسن",
      fatherName: "محمد حسن",
      date: "22/2/2025",
      grade: "المرحلة الإعدادية",
      class: "1/أ",
    },
    {
      id: 4,
      name: "أحمد محمد حسن",
      fatherName: "محمد حسن",
      date: "22/2/2025",
      grade: "رياض الأطفال",
      class: "3/ج",
    },
    {
      id: 5,
      name: "أحمد محمد حسن",
      fatherName: "محمد حسن",
      date: "22/2/2025",
      grade: "المرحلة الابتدائية",
      class: "3/ج",
    },
    {
      id: 6,
      name: "أحمد محمد حسن",
      fatherName: "محمد حسن",
      date: "22/2/2025",
      grade: "المرحلة الابتدائية",
      class: "1/أ",
    },
  ];

  const columns = [
    { header: "#", accessor: (row: Student) => row.id },
    {
      header: "studentManagement.studentName",
      accessor: (row: Student) => row.name,
      headerClassName: "min-w-[150px]",
    },
    {
      header: "studentManagement.educationalStage",
      accessor: (row: Student) => row.grade,
      headerClassName: "min-w-[200px]",
    },
    {
      header: "studentManagement.classes",
      accessor: (row: Student) => row.class,
      headerClassName: "min-w-[200px]",
    },
    {
      header: "studentManagement.date",
      accessor: (row: Student) => row.date,
      headerClassName: "min-w-[150px]",
    },
    {
      header: "common.actions",
      accessor: () => (
        <div className="flex items-center gap-2">
          <button className="p-2 text-green-600 hover:bg-green-100 bg-green-50 rounded-full transition-colors">
            <img src={EditIcon} alt="Edit" />
          </button>
          <button className="p-2 text-red-600 hover:bg-red-100 bg-red-50 rounded-full transition-colors">
            <img src={TrashIcon} alt="Edit" />
          </button>
        </div>
      ),
      headerClassName: "min-w-[150px]",
    },
  ];

  return (
    <Card>
      {!hasStudents ? (
        <EmptyState
          imgSrc={StudentIcon}
          description={t("studentManagement.noStudentsMessage")}
          blend={true}
        />
      ) : (
        <div>
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 p-4 rounded-lg">
            <div className="relative">
              <input
                type="text"
                placeholder={t("studentManagement.searchByStudentName")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 h-[40px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                <path
                  d="M11 1.25C5.61522 1.25 1.25 5.61522 1.25 11C1.25 16.3848 5.61522 20.75 11 20.75C13.4226 20.75 15.6366 19.8638 17.3418 18.4014L21.4697 22.5303C21.7626 22.8232 22.2374 22.8232 22.5303 22.5303C22.8232 22.2374 22.8232 21.7626 22.5303 21.4697L18.4023 17.3408C19.8643 15.6358 20.75 13.4221 20.75 11C20.75 5.61522 16.3848 1.25 11 1.25ZM11 2.75C15.5563 2.75 19.25 6.44365 19.25 11C19.25 15.5563 15.5563 19.25 11 19.25C6.44365 19.25 2.75 15.5563 2.75 11C2.75 6.44365 6.44365 2.75 11 2.75Z"
                  fill="#878F8F"
                />
              </svg>
            </div>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full h-[40px] px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white"
            >
              <option value="">
                {t("studentManagement.educationalStage")}
              </option>
              <option value="primary">المرحلة الابتدائية</option>
              <option value="middle">المرحلة الإعدادية</option>
              <option value="high">المرحلة الثانوية</option>
            </select>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full h-[40px] px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white"
            >
              <option value="">{t("studentManagement.classes")}</option>
              <option value="1a">1/أ</option>
              <option value="2a">2/أ</option>
              <option value="3a">3/أ</option>
            </select>
            <select
              value={selectedCreatedBy}
              onChange={(e) => setSelectedCreatedBy(e.target.value)}
              className="w-full h-[40px] px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white"
            >
              <option value="">{t("studentManagement.createdBy")}</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
            <select
              value={selectedHistory}
              onChange={(e) => setSelectedHistory(e.target.value)}
              className="w-full h-[40px] px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white"
            >
              <option value="">{t("studentManagement.date")}</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              data={students}
              keyExtractor={(row) => row.id}
            />
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">عرض الآن 1-7 من الطلاب</div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                التالي
              </button>
              <button className="px-3 py-1 text-sm bg-green-600 text-white rounded">
                1
              </button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                2
              </button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                السابق
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
