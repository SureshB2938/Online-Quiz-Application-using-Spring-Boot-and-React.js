import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import UserDashboard from './components/UserDashboard';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import AdminProfile from './components/AdminProfile';
import AddExam from './components/AddExam';
import AddQuestions from './components/AddQuestions';
import ExamList from './components/ExamList';
import Header from './components/Header';
import Footer from './components/Footer';
import ExamInterface from './components/ExamInterface';
import ManageUsers from './components/ManageUsers';
import UserProfileDetails from './components/UserProfileDetails';
import UserProfile from './components/UserProfile';


function AppContent() {
  const location = useLocation();
  
  const isAdminAuthenticated = () => {
    return localStorage.getItem('adminToken') !== null;
  };

  const isUserAuthenticated = () => {
    return localStorage.getItem('userToken') !== null;
  };

  // Hide header on admin pages and user dashboard
  const showHeader = !location.pathname.startsWith('/admin/') && 
                    !location.pathname.startsWith('/user/dashboard');

  return (
    <div style={{ 
      minHeight: '100vh',
      position: 'relative', 
      paddingTop: showHeader ? '70px' : '0', 
      paddingBottom: '60px' 
    }}>
      {showHeader && <Header />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/user/profile" element={<UserProfile />} />

        {/* User Routes */}
        <Route 
          path="/user/dashboard" 
          element={
            isUserAuthenticated() ? 
            <UserDashboard /> : 
            <Navigate to="/" />
          } 
        />
        
        {/* Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            isAdminAuthenticated() ? 
            <AdminDashboard /> : 
            <Navigate to="/admin" />
          } 
        />
        <Route 
          path="/admin/profile" 
          element={
            isAdminAuthenticated() ? 
            <AdminProfile /> : 
            <Navigate to="/admin" />
          } 
        />
        <Route 
          path="/admin/add-exam" 
          element={
            isAdminAuthenticated() ? 
            <AddExam /> : 
            <Navigate to="/admin" />
          } 
        />
        <Route 
          path="/admin/exams" 
          element={
            isAdminAuthenticated() ? 
            <ExamList /> : 
            <Navigate to="/admin" />
          } 
        />
        <Route 
          path="/admin/add-questions/:examId" 
          element={
            isAdminAuthenticated() ? 
            <AddQuestions /> : 
            <Navigate to="/admin" />
          } 
        />
        <Route 
  path="/exam/:examId" 
  element={
    localStorage.getItem('userToken') ? 
    <ExamInterface /> : 
    <Navigate to="/" />
  } 
/>
<Route 
  path="/admin/manage-users" 
  element={
    isAdminAuthenticated() ? 
    <ManageUsers /> : 
    <Navigate to="/admin" />
  } 
/>
<Route 
  path="/admin/user/:userId" 
  element={
    isAdminAuthenticated() ? 
    <UserProfileDetails /> : 
    <Navigate to="/admin" />
  } 
/>

        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </div>
    
  );
}

function App() {
  return <AppContent />;
}

export default App;
