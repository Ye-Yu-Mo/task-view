import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTask } from '../../services/task';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const CreateTaskPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [inviteId, setInviteId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('任务标题不能为空');
      return;
    }

    if (!inviteId.trim()) {
      setError('邀请码ID不能为空');
      return;
    }

    if (!user) {
      setError('请先登录');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        creator_id: user.id,
        invite_id: inviteId.trim(),
      });

      // 创建成功后跳转到任务看板
      navigate(`/board/${inviteId.trim()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建任务失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">创建新任务</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              任务标题 *
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入任务标题"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              任务描述
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请输入任务描述（可选）"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="inviteId" className="block text-sm font-medium text-gray-700 mb-1">
              邀请码ID *
            </label>
            <Input
              id="inviteId"
              type="text"
              value={inviteId}
              onChange={(e) => setInviteId(e.target.value)}
              placeholder="请输入邀请码ID"
              required
            />
          </div>

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              取消
            </Button>
            <Button
              type="submit"
              isLoading={loading}
              disabled={loading}
            >
              创建任务
            </Button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-2">重要提示：</h3>
          <p className="text-sm text-blue-700">
            • 请输入<b>邀请码的ID</b>（不是邀请码本身）<br/>
            • 邀请码ID可以在<b>邀请码管理页面</b>找到并复制<br/>
            • 只有创建者可以创建任务<br/>
            • 任务创建后会自动分配给对应的邀请码
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskPage;
