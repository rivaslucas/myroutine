import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WeeklyPlanner from './pages/WeeklyPlanner';
import MonthlyPlanner from './pages/MonthlyPlanner';
import Reminders from './pages/Reminders';
import Reports from './pages/Reports';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '562848642665-nab6t4utosqd6t4ujulnikj72t2dh9ib.apps.googleusercontent.com';

function App() {
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <Router>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        
                        <Route
                            path="/*"
                            element={
                                <ProtectedRoute>
                                    <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6' }}>
                                        <Navbar />
                                        <div style={{ paddingTop: '20px' }}>
                                            <Routes>
                                                <Route path="/dashboard" element={<Dashboard />} />
                                                <Route path="/weekly" element={<WeeklyPlanner />} />
                                                <Route path="/monthly" element={<MonthlyPlanner />} />
                                                <Route path="/reminders" element={<Reminders />} />
                                                <Route path="/" element={<Navigate to="/dashboard" />} />
                                                <Route path="/reports" element={<Reports />} />
                                            </Routes>
                                        </div>
                                    </div>
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </AuthProvider>
            </Router>
        </GoogleOAuthProvider>
    );
}

export default App;