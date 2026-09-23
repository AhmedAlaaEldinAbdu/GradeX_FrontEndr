import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loginWithCallbackToken } from '@gradex/redux/features/auth/authSlice';
import type { AppDispatch } from '@gradex/redux/store/store';
import { logger } from '@/lib/utils/logger';

const AuthCallbackPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const encryptedToken = searchParams.get('access_token');
  const schoolBrancheId = searchParams.get('schoolBrancheId') ?? searchParams.get('schoolBranchId');

  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    if (!encryptedToken) {
      navigate('/login', { replace: true });
      return;
    }

    (async () => {
      try {
        const result = await dispatch(
          loginWithCallbackToken({
            encryptedToken,
            schoolBrancheId,
            rememberMe: true,
          })
        ).unwrap();

        logger.success('Callback login successful, navigating to dashboard...');

        const target =
          result.user.schoolBrancheId == null ? '/super-admin/dashboard' : '/school/dashboard';
        navigate(target, { replace: true });
      } catch (err) {
        logger.error('Callback login failed - redirecting to /login', err);
        navigate('/login', { replace: true });
      }
    })();
  }, [dispatch, encryptedToken, schoolBrancheId, navigate]);

  if (!encryptedToken) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-[#E6FBF5] via-[#DFF8EE] to-[#E8F9F0]">
      <div className="w-full max-w-md px-6 text-center">
        <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-[#1FAD6C] border-t-transparent" />
        <p className="text-lg font-medium text-[#1FAD6C]">
          {t('login.signingIn') || 'Signing you in...'}
        </p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
