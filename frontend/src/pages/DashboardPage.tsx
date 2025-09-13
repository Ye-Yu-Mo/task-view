import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">未登录</h1>
          <p className="text-gray-600 mt-2">请先登录账号</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">TaskView</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                欢迎回来，{user.username}
              </span>
              <Button
                variant="outline"
                onClick={logout}
                size="sm"
              >
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              用户信息
            </h2>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">用户名</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.username}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">邮箱</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">角色</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'creator' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role === 'creator' ? '任务创建者' : '任务执行者'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">注册时间</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(user.created_at).toLocaleString('zh-CN')}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-8 bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {user.role === 'creator' ? '创建者功能' : '执行者功能'}
            </h2>
            <div className="space-y-4">
              {user.role === 'creator' ? (
                <>
                  <p className="text-sm text-gray-600">
                    作为任务创建者，您可以：
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>生成邀请码并分享给执行者</li>
                    <li>创建和管理任务</li>
                    <li>查看任务执行进度</li>
                    <li>与执行者协作完成项目</li>
                  </ul>
                  <div className="pt-4 space-x-4">
                    <Link to="/invite/create">
                      <Button>生成邀请码</Button>
                    </Link>
                    <Link to="/tasks/create">
                      <Button variant="outline">创建任务</Button>
                    </Link>
                    <Link to="/tasks">
                      <Button variant="outline">查看任务看板</Button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600">
                    作为任务执行者，您可以：
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>使用邀请码加入项目</li>
                    <li>查看分配给您的任务</li>
                    <li>更新任务执行状态</li>
                    <li>与创建者沟通协作</li>
                  </ul>
                  <div className="pt-4 space-x-4">
                    <Link to="/invite/use">
                      <Button>使用邀请码</Button>
                    </Link>
                    <Link to="/tasks">
                      <Button variant="outline">查看任务看板</Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
