import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createInvite, getInvites, type Invite } from '../../services/invite';
import { Button } from '../../components/ui/Button';

export const CreateInvitePage: React.FC = () => {
  const { user } = useAuth();
  const [inviteCode, setInviteCode] = useState<string>('');
  const [allInvites, setAllInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingInvites, setIsLoadingInvites] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadInvites();
    }
  }, [user]);

  const loadInvites = async () => {
    if (!user) return;
    
    setIsLoadingInvites(true);
    try {
      const response = await getInvites(user.id);
      setAllInvites(response.invites);
    } catch (err) {
      console.error('获取邀请码列表失败:', err);
    } finally {
      setIsLoadingInvites(false);
    }
  };

  const handleCreateInvite = async () => {
    if (!user) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await createInvite({
        creator_id: user.id
      });
      
      setInviteCode(response.code);
      // 创建成功后重新加载邀请码列表
      await loadInvites();
    } catch (err) {
      console.error('生成邀请码错误详情:', err);
      setError(err instanceof Error ? err.message : '生成邀请码失败，请检查控制台查看详情');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!inviteCode) return;

    try {
      await navigator.clipboard.writeText(inviteCode);
      alert('邀请码已复制到剪贴板');
    } catch (err) {
      alert('复制失败，请手动复制');
    }
  };

  if (!user || user.role !== 'creator') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">权限不足</h1>
          <p className="text-gray-600 mt-2">只有任务创建者可以生成邀请码</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          生成邀请码
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {inviteCode ? (
          <div className="text-center">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                生成的邀请码
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={inviteCode}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-center font-mono text-lg bg-gray-50"
                />
                <button
                  onClick={copyToClipboard}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  title="复制邀请码"
                >
                  📋
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
              <h3 className="font-medium text-blue-800 mb-2">使用说明</h3>
              <p className="text-blue-700 text-sm">
                请将此邀请码分享给任务执行者，他们可以通过输入此邀请码与您建立绑定关系。
              </p>
            </div>

            <Button onClick={handleCreateInvite} variant="outline">
              生成新的邀请码
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                点击下方按钮生成一个唯一的邀请码，用于邀请任务执行者加入您的项目。
              </p>
              <p className="text-sm text-gray-500">
                每个邀请码只能使用一次，有效期为30天。
              </p>
            </div>

            <Button
              onClick={handleCreateInvite}
              isLoading={isLoading}
              size="lg"
            >
              {isLoading ? '生成中...' : '生成邀请码'}
            </Button>
          </div>
        )}

        {/* 邀请码列表 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-medium text-gray-900 mb-4">已生成的邀请码</h3>
          
          {isLoadingInvites ? (
            <div className="text-center py-4">
              <p className="text-gray-500">加载中...</p>
            </div>
          ) : allInvites.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">暂无邀请码</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {allInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="p-3 bg-gray-50 rounded-md border border-gray-200"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-mono text-sm bg-white px-2 py-1 rounded border">
                        {invite.code}
                      </span>
                      <span className={`ml-2 text-xs px-2 py-1 rounded ${
                        invite.status === 'pending' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {invite.status === 'pending' ? '未使用' : '已使用'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(invite.created_at).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                  
                  {/* 显示邀请码ID */}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-xs text-gray-600">
                      ID: <span className="font-mono">{invite.id}</span>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(invite.id)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                      title="复制ID"
                    >
                      📋 复制ID
                    </button>
                  </div>
                  
                  {invite.executor_id && (
                    <div className="text-xs text-gray-600 mt-1">
                      执行者: {invite.executor_id}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="font-medium text-gray-900 mb-2">注意事项</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 每个创建者可以生成多个邀请码</li>
            <li>• 邀请码使用后即失效</li>
            <li>• 执行者输入邀请码后会自动与您绑定</li>
            <li>• 绑定后您可以给执行者分配任务</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
