import "./App.css";
import {
   BrowserRouter as Router,
   Routes,
   Route,
   Navigate,
} from "react-router-dom";
import { MainLayout } from "./shared/layout/layout";
import StudentManagementPage from "./pages/student-management/student-management-page";
import "./i18n";

function App() {
   return (
      <Router>
         <Routes>
            <Route
               path="/"
               element={
                  <MainLayout>
                     <div className="flex items-center justify-center h-full">
                        <h1 className="text-3xl font-bold text-gray-800">
                           مرحباً بك في GradeX
                        </h1>
                     </div>
                  </MainLayout>
               }
            />
            {/* /student-management/* */}
            {/* /student-management/students */}
            {/* /student-management/attendance-requests */}
            <Route
               path="/students"
               element={
                  <MainLayout>
                     <StudentManagementPage />
                  </MainLayout>
               }
            />
            <Route
               path="/classes"
               element={
                  <MainLayout>
                     <div className="text-center py-16">
                        <h2 className="text-2xl font-bold text-gray-800">
                           الصفوف الدراسية
                        </h2>
                        <p className="text-gray-600 mt-4">قريباً...</p>
                     </div>
                  </MainLayout>
               }
            />
            <Route
               path="/attendance-requests"
               element={
                  <MainLayout>
                     <div className="text-center py-16">
                        <h2 className="text-2xl font-bold text-gray-800">
                           طلبات التقديم
                        </h2>
                        <p className="text-gray-600 mt-4">قريباً...</p>
                     </div>
                  </MainLayout>
               }
            />
            <Route
               path="/educational-stages"
               element={
                  <MainLayout>
                     <div className="text-center py-16">
                        <h2 className="text-2xl font-bold text-gray-800">
                           المراحل التعليمية
                        </h2>
                        <p className="text-gray-600 mt-4">قريباً...</p>
                     </div>
                  </MainLayout>
               }
            />
            <Route
               path="/subjects"
               element={
                  <MainLayout>
                     <div className="text-center py-16">
                        <h2 className="text-2xl font-bold text-gray-800">
                           المواد الدراسية
                        </h2>
                        <p className="text-gray-600 mt-4">قريباً...</p>
                     </div>
                  </MainLayout>
               }
            />
            <Route
               path="/books"
               element={
                  <MainLayout>
                     <div className="text-center py-16">
                        <h2 className="text-2xl font-bold text-gray-800">
                           الكتب الدراسية
                        </h2>
                        <p className="text-gray-600 mt-4">قريباً...</p>
                     </div>
                  </MainLayout>
               }
            />
            <Route
               path="/teaching-staff"
               element={
                  <MainLayout>
                     <div className="text-center py-16">
                        <h2 className="text-2xl font-bold text-gray-800">
                           الكادر التعليمي
                        </h2>
                        <p className="text-gray-600 mt-4">قريباً...</p>
                     </div>
                  </MainLayout>
               }
            />
            <Route
               path="/academic-calendar"
               element={
                  <MainLayout>
                     <div className="text-center py-16">
                        <h2 className="text-2xl font-bold text-gray-800">
                           التقويم الأكاديمي
                        </h2>
                        <p className="text-gray-600 mt-4">قريباً...</p>
                     </div>
                  </MainLayout>
               }
            />
            <Route
               path="/student-management"
               element={
                  <MainLayout>
                     <div className="text-center py-16">
                        <h2 className="text-2xl font-bold text-gray-800">
                           إدارة الطلاب
                        </h2>
                        <p className="text-gray-600 mt-4">قريباً...</p>
                     </div>
                  </MainLayout>
               }
            />
            <Route
               path="/attendance"
               element={
                  <MainLayout>
                     <div className="text-center py-16">
                        <h2 className="text-2xl font-bold text-gray-800">
                           الحضور والإنصراف
                        </h2>
                        <p className="text-gray-600 mt-4">قريباً...</p>
                     </div>
                  </MainLayout>
               }
            />
            <Route
               path="/fees"
               element={
                  <MainLayout>
                     <div className="text-center py-16">
                        <h2 className="text-2xl font-bold text-gray-800">
                           الرسوم الدراسية
                        </h2>
                        <p className="text-gray-600 mt-4">قريباً...</p>
                     </div>
                  </MainLayout>
               }
            />
            <Route
               path="/bus-management"
               element={
                  <MainLayout>
                     <div className="text-center py-16">
                        <h2 className="text-2xl font-bold text-gray-800">
                           إدارة الامتحانات
                        </h2>
                        <p className="text-gray-600 mt-4">قريباً...</p>
                     </div>
                  </MainLayout>
               }
            />
            <Route
               path="/notifications"
               element={
                  <MainLayout>
                     <div className="text-center py-16">
                        <h2 className="text-2xl font-bold text-gray-800">
                           الإشعارات
                        </h2>
                        <p className="text-gray-600 mt-4">قريباً...</p>
                     </div>
                  </MainLayout>
               }
            />
            <Route
               path="/reports"
               element={
                  <MainLayout>
                     <div className="text-center py-16">
                        <h2 className="text-2xl font-bold text-gray-800">
                           التقارير
                        </h2>
                        <p className="text-gray-600 mt-4">قريباً...</p>
                     </div>
                  </MainLayout>
               }
            />
            <Route
               path="/settings"
               element={
                  <MainLayout>
                     <div className="text-center py-16">
                        <h2 className="text-2xl font-bold text-gray-800">
                           الإعدادات
                        </h2>
                        <p className="text-gray-600 mt-4">قريباً...</p>
                     </div>
                  </MainLayout>
               }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
         </Routes>
      </Router>
   );
}

export default App;
