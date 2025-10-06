import React from "react";
import { Breadcrumb } from "../../shared/layout/layout";
import { Button } from "../../shared/components/components";
import StudentManagement from "./components/StudentManagement";
import { useTranslation } from "react-i18next";

const StudentManagementPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div dir="rtl">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: "الطلاب" }]} />

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">الطلاب</h1>
        <Button icon={<span className="text-lg">+</span>}>إضافة طالب</Button>
      </div>

      {/* Main Content */}
      <StudentManagement />
    </div>
  );
};

export default StudentManagementPage;
