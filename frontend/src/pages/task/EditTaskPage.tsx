import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTasks, updateTask } from '../../services/task';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const EditTaskPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (taskId) {
      loadTask();
    }
  }, [taskId]);

  const loadTask = async () => {
    try {
      setFetching(true);
      // 这里需要先获取任务详情，暂时使用getTasks然后过滤
      const response = await getTasks('');
      const task = response.tasks.find(t => t.id === taskId);
      
      if (task) {
        setTitle(task.title);
        setDescription(task.description || '');
        setStatus(task.status);
      } else {
        setError('任务不存在');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取任务失败');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('任务标题不能为空');
      return;
    }

    if (!taskId) {
      setError('任务ID不存在');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updateTask(taskId, {
        title: title.trim(),
        description: description.trim() || undefined,
        status: status,
      });

      // 更新成功后返回任务列表
      navigate(-1);
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新任务失败');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error && !fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <Button onClick={() => navigate(-1)}>返回</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">编辑任务</h2>
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
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              任务状态
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todo">待处理</option>
              <option value="in_progress">进行中</option>
              <option value="done">已完成</option>
            </select>
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
              更新任务
            </Button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-2">提示：</h3>
          <p className="text-sm text-blue-700">
            • 只有任务创建者可以编辑任务<br/>
            • 执行者只能更新任务状态<br/>
            • 任务状态变更会记录更新时间
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditTaskPage;
