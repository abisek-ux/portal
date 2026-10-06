import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

import StudentDashboard from './pages/student/StudentDashboard';
import SkillAssessment from './pages/student/SkillAssessment';
import Internships from './pages/student/Internships';
import MyApplications from './pages/student/MyApplications';
import MyPortfolio from './pages/student/MyPortfolio';
import LearningPrograms from './pages/student/LearningPrograms';

import IndustryDashboard from './pages/industry/IndustryDashboard';
import PostInternship from './pages/industry/PostInternship';
import ManageApplications from './pages/industry/ManageApplications';
import IndustryPrograms from './pages/industry/IndustryPrograms';

import AcademicDashboard from './pages/academician/AcademicDashboard';
import AcademiaOpportunities from './pages/academician/AcademiaOpportunities';
import Collaborations from './pages/Collaborations';

import AdminDashboard from './pages/admin/AdminDashboard';

const Shell = ({ children }) => (
  <Navbar>
    <>{children}</>
  </Navbar>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<ProtectedRoute><Shell><RoleDashboard /></Shell></ProtectedRoute>} />
          <Route path="/skills" element={<ProtectedRoute roles={['student']}><Shell><SkillAssessment /></Shell></ProtectedRoute>} />
          <Route path="/internships" element={<ProtectedRoute roles={['student']}><Shell><Internships /></Shell></ProtectedRoute>} />
          <Route path="/my-applications" element={<ProtectedRoute roles={['student', 'academician']}><Shell><MyApplications /></Shell></ProtectedRoute>} />
          <Route path="/portfolio" element={<ProtectedRoute roles={['student']}><Shell><MyPortfolio /></Shell></ProtectedRoute>} />
          <Route path="/programs" element={<ProtectedRoute roles={['student']}><Shell><LearningPrograms /></Shell></ProtectedRoute>} />

          <Route path="/post-internship" element={<ProtectedRoute roles={['industry']}><Shell><PostInternship /></Shell></ProtectedRoute>} />
          <Route path="/manage-applications" element={<ProtectedRoute roles={['industry']}><Shell><ManageApplications /></Shell></ProtectedRoute>} />
          <Route path="/industry-programs" element={<ProtectedRoute roles={['industry']}><Shell><IndustryPrograms /></Shell></ProtectedRoute>} />

          <Route path="/academia-opportunities" element={<ProtectedRoute roles={['academician']}><Shell><AcademiaOpportunities /></Shell></ProtectedRoute>} />
          <Route path="/collaborations" element={<ProtectedRoute roles={['academician', 'industry', 'admin']}><Shell><Collaborations /></Shell></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Shell><AdminDashboard /></Shell></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

const RoleDashboard = () => {
  const { user } = useAuth();
  if (user?.role === 'student') return <StudentDashboard />;
  if (user?.role === 'industry') return <IndustryDashboard />;
  if (user?.role === 'academician') return <AcademicDashboard />;
  return <AdminDashboard />;
};

export default App;