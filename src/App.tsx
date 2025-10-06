import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { MainLayout } from "./shared/layout/layout";
import StudentManagementPage from "./pages/student-management/student-management-page";
import "./i18n";

function App() {
  return (
    <>
      <Router>
        <Routes>
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
        </Routes>
      </Router>
    </>
  );
}

export default App;
