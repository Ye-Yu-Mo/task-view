import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const schema = yup.object({
  email: yup
    .string()
    .required('请输入邮箱地址')
    .email('请输入有效的邮箱地址'),
  password: yup
    .string()
    .required('请输入密码')
    .min(6, '密码至少6位'),
});

type FormData = yup.InferType<typeof schema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError('');
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            登录 TaskView
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            还没有账号？{' '}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              立即注册
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
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
              autoComplete="current-password"
              placeholder="请输入密码"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          {error && (
            <div className="error-alert">
              {error}
            </div>
          )}

          <div>
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? '登录中...' : '登录'}
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
