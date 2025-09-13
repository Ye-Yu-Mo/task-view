import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTasks, deleteTask } from '../../services/task';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  creator_id: string;
  executor_id?: string;
  invite_id: string;
  created_at: string;
  updated_at: string;
}

const TaskListPage: React.FC = () => {
  const { inviteId } = useParams<{ inviteId: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { user } = useAuth();

  useEffect(() => {
    if (inviteId) {
      loadTasks();
    }
  }, [inviteId]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await getTasks(inviteId!);
      setTasks(response.tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取任务列表失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'todo':
        return '待处理';
      case 'in_progress':
        return '进行中';
      case 'done':
        return '已完成';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setDeletingTaskId(taskId);
      await deleteTask(taskId);
      // 删除成功后重新加载任务列表
      await loadTasks();
      setShowDeleteConfirm(false);
      setDeletingTaskId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除任务失败');
      setShowDeleteConfirm(false);
      setDeletingTaskId(null);
    }
  };

  const confirmDelete = (taskId: string) => {
    setDeletingTaskId(taskId);
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletingTaskId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <Button onClick={loadTasks}>重试</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">任务列表</h1>
          {user?.role === 'creator' && (
            <Link to={`/tasks/create?inviteId=${inviteId}`}>
              <Button>创建新任务</Button>
            </Link>
          )}
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无任务</h3>
            <p className="text-gray-600 mb-6">还没有创建任何任务</p>
            {user?.role === 'creator' && (
              <Link to={`/tasks/create?inviteId=${inviteId}`}>
                <Button>创建第一个任务</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{task.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                    {getStatusText(task.status)}
                  </span>
                </div>

                {task.description && (
                  <p className="text-gray-600 mb-4">{task.description}</p>
                )}

                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div>
                    <span>创建时间: {new Date(task.created_at).toLocaleDateString()}</span>
                    {task.executor_id && (
                      <span className="ml-4">执行者: {task.executor_id}</span>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      查看详情
                    </Button>
                    <Button variant="outline" size="sm">
                      编辑
                    </Button>
                    {user?.role === 'creator' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => confirmDelete(task.id)}
                        isLoading={deletingTaskId === task.id}
                      >
                        删除
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to="/dashboard">
            <Button variant="secondary">返回仪表板</Button>
          </Link>
        </div>

        {/* 删除确认对话框 */}
        {showDeleteConfirm && deletingTaskId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">确认删除</h3>
              <p className="text-gray-600 mb-6">确定要删除这个任务吗？此操作不可恢复。</p>
              <div className="flex space-x-4 justify-end">
                <Button
                  variant="secondary"
                  onClick={cancelDelete}
                  disabled={deletingTaskId !== null}
                >
                  取消
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleDeleteTask(deletingTaskId)}
                  isLoading={deletingTaskId !== null}
                  disabled={deletingTaskId !== null}
                >
                  确认删除
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskListPage;
