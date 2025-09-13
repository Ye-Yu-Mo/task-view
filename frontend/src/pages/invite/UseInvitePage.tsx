import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useInvite } from '../../services/invite';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const UseInvitePage: React.FC = () => {
  const { user } = useAuth();
  const [inviteCode, setInviteCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleUseInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await useInvite({
        code: inviteCode.trim(),
        executor_id: user.id
      });
      
      setSuccess(response.message);
      setInviteCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '使用邀请码失败');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.role !== 'executor') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">权限不足</h1>
          <p className="text-gray-600 mt-2">只有任务执行者可以使用邀请码</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          使用邀请码
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleUseInvite} className="space-y-4">
          <div>
            <Input
              label="邀请码"
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="请输入8位邀请码"
              required
              autoComplete="off"
              className="text-center font-mono uppercase"
            />
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full"
            size="lg"
            disabled={!inviteCode.trim()}
          >
            {isLoading ? '绑定中...' : '绑定邀请码'}
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="font-medium text-gray-900 mb-2">使用说明</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 请输入任务创建者提供的8位邀请码</li>
            <li>• 绑定成功后，您将能够看到创建者分配的任务</li>
            <li>• 每个执行者只能绑定一个创建者</li>
            <li>• 绑定关系建立后无法更改</li>
          </ul>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="font-medium text-blue-800 mb-1">如何获取邀请码？</h4>
          <p className="text-blue-700 text-sm">
            请联系您的任务创建者获取邀请码。创建者可以在他们的仪表板中生成邀请码并分享给您。
          </p>
        </div>
      </div>
    </div>
  );
};
