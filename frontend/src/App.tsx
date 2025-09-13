import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { BoardPage } from './pages/BoardPage'
import { CreateInvitePage } from './pages/invite/CreateInvitePage'
import { UseInvitePage } from './pages/invite/UseInvitePage'
import CreateTaskPage from './pages/task/CreateTaskPage'
import TaskListPage from './pages/task/TaskListPage'
import EditTaskPage from './pages/task/EditTaskPage'
import { TaskBoardListPage } from './pages/task/TaskBoardListPage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/board/:inviteId" element={
              <ProtectedRoute>
                <BoardPage />
              </ProtectedRoute>
            } />
            <Route path="/invite/create" element={
              <ProtectedRoute>
                <CreateInvitePage />
              </ProtectedRoute>
            } />
            <Route path="/invite/use" element={
              <ProtectedRoute>
                <UseInvitePage />
              </ProtectedRoute>
            } />
            <Route path="/invite" element={<Invite />} />
            <Route path="/tasks/create" element={
              <ProtectedRoute>
                <CreateTaskPage />
              </ProtectedRoute>
            } />
            <Route path="/tasks/:inviteId" element={
              <ProtectedRoute>
                <TaskListPage />
              </ProtectedRoute>
            } />
            <Route path="/tasks/edit/:taskId" element={
              <ProtectedRoute>
                <EditTaskPage />
              </ProtectedRoute>
            } />
            <Route path="/tasks" element={
              <ProtectedRoute>
                <TaskBoardListPage />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

// 受保护的路由组件
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// 首页组件
const Home = () => {
  const { user } = useAuth();
  
  // 如果已登录，重定向到仪表板
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">TaskView</h1>
        <p className="text-gray-600 mb-8">任务看板管理系统</p>
        <div className="space-x-4">
          <a href="/login" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            登录
          </a>
          <a href="/register" className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            注册
          </a>
        </div>
      </div>
    </div>
  )
}

const Invite = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-6">邀请管理</h1>
    <p className="text-gray-600">邀请管理开发中...</p>
  </div>
)

export default App
