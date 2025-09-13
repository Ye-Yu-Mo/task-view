import React from 'react';
import type { UserRole } from '../../types/auth';

interface RoleSelectorProps {
  value: UserRole | '';
  onChange: (role: UserRole) => void;
  error?: string;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ value, onChange, error }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        选择你的角色
      </label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div
          className={`
            relative rounded-lg border-2 p-4 cursor-pointer transition-all
            ${value === 'creator' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
            }
          `}
          onClick={() => onChange('creator')}
        >
          <div className="flex items-center">
            <input
              type="radio"
              name="role"
              value="creator"
              checked={value === 'creator'}
              onChange={() => onChange('creator')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div className="ml-3">
              <div className="font-medium text-gray-900">任务创建者</div>
              <div className="text-sm text-gray-500">
                创建任务，管理项目，发送邀请码
              </div>
            </div>
          </div>
        </div>

        <div
          className={`
            relative rounded-lg border-2 p-4 cursor-pointer transition-all
            ${value === 'executor' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
            }
          `}
          onClick={() => onChange('executor')}
        >
          <div className="flex items-center">
            <input
              type="radio"
              name="role"
              value="executor"
              checked={value === 'executor'}
              onChange={() => onChange('executor')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div className="ml-3">
              <div className="font-medium text-gray-900">任务执行者</div>
              <div className="text-sm text-gray-500">
                接收任务，执行工作，更新进度
              </div>
            </div>
          </div>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};