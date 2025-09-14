import React, { useState } from 'react';
import type { Task } from '../../services/task';

interface TaskCompletionModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (taskId: string, completionDetails: string) => Promise<void>;
}

export const TaskCompletionModal: React.FC<TaskCompletionModalProps> = ({
  task,
  isOpen,
  onClose,
  onComplete
}) => {
  const [completionDetails, setCompletionDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completionDetails.trim()) {
      alert('请输入任务完成详情');
      return;
    }

    setIsSubmitting(true);
    try {
      await onComplete(task.id, completionDetails);
      setCompletionDetails('');
      onClose();
    } catch (error) {
      console.error('更新任务状态失败:', error);
      alert('更新任务状态失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{zIndex: 9999}}>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">
            完成任务
          </h3>
          
          <div className="mb-4 bg-white bg-opacity-60 rounded-md p-3 border border-blue-200">
            <p className="text-sm text-blue-600 mb-2">任务标题:</p>
            <p className="font-medium text-blue-900">{task.title}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="completionDetails" className="block text-sm font-medium text-blue-700 mb-2">
                完成详情 *
              </label>
              <textarea
                id="completionDetails"
                value={completionDetails}
                onChange={(e) => setCompletionDetails(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white placeholder-blue-400 font-medium"
                style={{
                  color: '#1f2937',
                  backgroundColor: '#ffffff',
                  fontSize: '14px'
                }}
                placeholder="请描述任务的完成情况、结果或相关说明..."
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !completionDetails.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 border border-transparent rounded-md hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
              >
                {isSubmitting ? '提交中...' : '✓ 完成任务'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};