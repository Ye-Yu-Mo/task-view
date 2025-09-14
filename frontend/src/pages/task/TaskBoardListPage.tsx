import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInvites, getExecutorInvites, type Invite } from '../../services/invite';
import { Button } from '../../components/ui/Button';

export const TaskBoardListPage: React.FC = () => {
  const { user } = useAuth();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadInvites();
    }
  }, [user]);

  const loadInvites = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError('');
    try {
      let invitesResponse;
      if (user.role === 'creator') {
        // 创建者：获取自己创建的所有邀请码
        invitesResponse = await getInvites(user.id);
      } else {
        // 执行者：获取与自己相关的邀请码
        invitesResponse = await getExecutorInvites(user.id);
      }
      setInvites(invitesResponse.invites);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载邀请码失败');
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="min-h-screen">
      <header className="modern-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">任务看板列表</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  返回仪表板
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">加载中...</p>
          </div>
        ) : invites.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">暂无邀请码</p>
            <Link to="/invite/create">
              <Button>生成第一个邀请码</Button>
            </Link>
          </div>
        ) : (
          <div className="modern-card">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">选择看板</h2>
              <p className="text-sm text-gray-600 mt-1">请选择要查看的任务看板</p>
            </div>
            
            <div className="divide-y divide-gray-200">
              {invites.map((invite) => (
                <div key={invite.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        邀请码: {invite.code}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        ID: {invite.id}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        创建时间: {new Date(invite.created_at).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        invite.status === 'pending' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {invite.status === 'pending' ? '未使用' : '已使用'}
                      </span>
                      
                      <Link to={`/board/${invite.id}`}>
                        <Button size="sm">查看看板</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
