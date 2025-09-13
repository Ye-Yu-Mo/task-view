import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { RoleSelector } from '../../components/ui/RoleSelector';
import type { UserRole } from '../../types/auth';

const schema = yup.object({
  username: yup
    .string()
    .required('请输入用户名')
    .min(2, '用户名至少2位')
    .max(20, '用户名不能超过20位'),
  email: yup
    .string()
    .required('请输入邮箱地址')
    .email('请输入有效的邮箱地址'),
  password: yup
    .string()
    .required('请输入密码')
    .min(6, '密码至少6位'),
  confirmPassword: yup
    .string()
    .required('请确认密码')
    .oneOf([yup.ref('password')], '两次输入的密码不一致'),
});

type FormData = yup.InferType<typeof schema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuth();
  const [error, setError] = useState<string>('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [roleError, setRoleError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    // 验证角色选择
    if (!role) {
      setRoleError('请选择用户角色');
      return;
    }

    try {
      setError('');
      setRoleError('');
      await registerUser(data.username, data.email, data.password, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败');
    }
  };

  const handleRoleChange = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setRoleError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            注册 TaskView
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            已有账号？{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              立即登录
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="用户名"
              type="text"
              autoComplete="username"
              placeholder="请输入用户名"
              error={errors.username?.message}
              {...register('username')}
            />

            <Input
              label="邮箱地址"
              type="email"
              autoComplete="email"
              placeholder="请输入邮箱地址"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="密码"
              type="password"
              autoComplete="new-password"
              placeholder="请输入密码（至少6位）"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="确认密码"
              type="password"
              autoComplete="new-password"
              placeholder="请再次输入密码"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <RoleSelector
              value={role}
              onChange={handleRoleChange}
              error={roleError}
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <div>
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? '注册中...' : '注册账号'}
            </Button>
          </div>

          <div className="text-center">
            <Link
              to="/"
              className="text-sm text-gray-600 hover:text-gray-500"
            >
              返回首页
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};