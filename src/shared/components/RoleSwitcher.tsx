import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UserRole, type UserRoleType } from '@gradex/constants';
import { selectUserRole } from '@gradex/redux/features/auth/authSelectors';
import { setUserRole } from '@gradex/redux/features/auth/authSlice';

interface RoleSwitcherProps {
  /** Visual variant of the switcher */
  variant?: 'default' | 'minimal' | 'icon-only';
  /** Additional CSS classes */
  className?: string;
  /** Size of the component */
  size?: 'sm' | 'md' | 'lg';
  /** Enable rendering outside dev (for QA/testing builds) */
  enabled?: boolean;
}

// TODO(TEST TEAM): Temporary role switcher. Remove RoleSwitcher + Header wiring later.
type StoredUserDataLike = {
  id?: string | number;
  name?: string;
  email?: string;
  role?: string;
  avatar?: string;
  isAuthenticated?: boolean;
  schoolBranchId?: string | null;
};

function normalizeRole(value: unknown): UserRoleType | null {
  if (value === UserRole.SUPER_ADMIN || value === UserRole.SCHOOL_ADMIN) return value;
  return null;
}

function readStoredUserData(storage: Storage): StoredUserDataLike | null {
  try {
    const raw = storage.getItem('userData');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredUserDataLike;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function writeStoredUserData(storage: Storage, data: StoredUserDataLike): void {
  storage.setItem('userData', JSON.stringify(data));
}

function getRoleSwitcherOverrideEnabled(): boolean {
  // Temporary escape hatch for deployed builds.
  // Enable by visiting: ?enableRoleSwitcher=1 (persists in localStorage)
  // Disable by visiting: ?enableRoleSwitcher=0
  try {
    const params = new URLSearchParams(window.location.search);
    const param = params.get('enableRoleSwitcher');

    if (param === '1' || param === 'true') {
      localStorage.setItem('enableRoleSwitcher', 'true');
      return true;
    }

    if (param === '0' || param === 'false') {
      localStorage.setItem('enableRoleSwitcher', 'false');
      return false;
    }

    return localStorage.getItem('enableRoleSwitcher') === 'true';
  } catch {
    return false;
  }
}

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  variant = 'minimal',
  className = '',
  size = 'md',
  enabled,
}) => {
  const dispatch = useDispatch();
  const reduxRole = useSelector(selectUserRole);

  const isEnabled = useMemo(() => {
    if (typeof enabled === 'boolean') return enabled;
    return (
      import.meta.env.DEV ||
      import.meta.env.VITE_ENABLE_ROLE_SWITCHER === 'true' ||
      getRoleSwitcherOverrideEnabled()
    );
  }, [enabled]);

  const currentRole = useMemo<UserRoleType>(() => {
    const local = readStoredUserData(localStorage);
    const session = readStoredUserData(sessionStorage);
    const storedRole = normalizeRole(local?.role) || normalizeRole(session?.role);
    if (storedRole) return storedRole;
    if (reduxRole === UserRole.SUPER_ADMIN || reduxRole === UserRole.SCHOOL_ADMIN) return reduxRole;
    return UserRole.SUPER_ADMIN;
  }, [reduxRole]);

  const nextRole = useMemo<UserRoleType>(() => {
    return currentRole === UserRole.SUPER_ADMIN ? UserRole.SCHOOL_ADMIN : UserRole.SUPER_ADMIN;
  }, [currentRole]);

  const onToggle = useCallback(() => {
    // Persist role inside existing `userData` entry (no extra keys).
    // Update both storages so it works with remember-me on/off.
    const local = readStoredUserData(localStorage);
    const session = readStoredUserData(sessionStorage);

    const nextLocal: StoredUserDataLike = local || {
      id: '1',
      name: 'Admin',
      email: 'admin@gradex.com',
      isAuthenticated: true,
      schoolBranchId: null,
    };
    nextLocal.role = nextRole;
    writeStoredUserData(localStorage, nextLocal);

    if (session) {
      session.role = nextRole;
      writeStoredUserData(sessionStorage, session);
    }

    dispatch(setUserRole(nextRole));
  }, [dispatch, nextRole]);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-3 text-base gap-3',
  };

  const baseClasses =
    'flex items-center font-medium transition-all focus:outline-hidden focus:ring-2 focus:ring-green-500 focus:ring-offset-2';

  if (!isEnabled) return null;
  const superAdminIocn = (
    <img
      className="h-[30px] w-[30px]"
      src="data:image/png;base64,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"
      alt="admin-settings-male"
    ></img>
  );

  const schoolAdminIcon = (
    <img
      className="h-[25px] w-[25px]"
      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAADCklEQVR4nO2Yy27aQBSGfycKoeuI+wsgRUpWVVX1AVAWvAG8QLPmlgfoZVspbKu+QqteNlWhKK0gjlQBEi/QZoMiZdMAUuupzjR2B3tsxjFpBolfOguMPfzfOWcuGLhdnQCYAjgH0AfwCsAhgPsAsgDuQXMxhTiBxuImLy4umGmarNlssnK5zPb399nOzo4IYUBTcYN+wj+ADWgqbpCyvbe3x0qlEjs+Pmanp6dsPB6vDoBCbGDFAQxopm0AzwWDLwA8BPAYwEsA3wD8APATwGdophiAN5IsfwAQh+aKA3hPhpPJJF86acImEgkb4u11dbRUzM48mR8MBs5yORqNWDqd1roScQDvbPPD4ZAbv7y85EEiIF0rEZeZJ8P0OZVKOdXQESIG4DUZImO2UVfL8O/6/b527RQXMy9mmT7T9YODAx6ye+66EjEx87LsFgoFNplM2Gw2Y8ViUatKbKtkfjqdOqsQgYiVEOdJ4g4q8SyM+ZAQT6KaozJ+VTm/0Calan4RRK/XUz0zfVnUauL5JTA6nQ7fZVXN+0GYpsna7bYqALvuAKkeAPi1ubnJut2ur4F6vS4dWMW8raurK+kYR0dHvs+cnZ2xra0tuu83gEdu8zR5hjQIGQwSrSp0TyaT4bHoX5dMlmU5z2UyGZbNZlmj0eBjB6lWq9nPjdwvBHjr5PN5XuIwigJgGEao56jKu7u7nlZSap0wAJTJarXqVKlSqcy12E0B/FqJ/lywqOFTaicISNZCiBbkfSkDzQGIc8MO2nVvAYB5AMJK9lwul/P8EEFFbSFLDo5PywagFcX9Q9RWtwDwUVyJ5ozQzXYEXfObxARBlaCgZVdcImUAlsLvuQA8mjMiq0rQtZtk0hAAxLFtw+5rawCsAf5qDQAFAFUtC0BF/w2Alkw6/9hnITpGLFpGlw4QZR8gw2E3MkunfUD1LGToOond5mXVXQNItAbQCkBVywJQkRIAve/RFaDVai0GWKHw6FwDU0wxvnvtA081MMYUQ/oSmN75EwTR3bXBoMyTefLK9QccOzdlR6iH6AAAAABJRU5ErkJggg=="
      alt="school-building"
    ></img>
  );

  const label = currentRole === UserRole.SUPER_ADMIN ? superAdminIocn : schoolAdminIcon;
  const title = currentRole === UserRole.SUPER_ADMIN ? 'Super Admin' : 'School Admin';
  const ariaLabel = `Switch role to ${nextRole === UserRole.SUPER_ADMIN ? 'Super Admin' : 'School Admin'}`;

  if (variant === 'icon-only') {
    return (
      <button
        type="button"
        onClick={onToggle}
        className={`${baseClasses} flex h-[32px] w-[32px] items-center justify-center rounded-[8px] text-[#9D9D9D] transition-colors hover:bg-[#ECFDF5] hover:text-[#1E7A52] ${className}`}
        aria-label={ariaLabel}
        title={title}
      >
        <span className="flex min-w-9 items-center justify-center text-center text-xs font-semibold">
          {label}
        </span>
      </button>
    );
  }

  if (variant === 'minimal') {
    return (
      <button
        type="button"
        onClick={onToggle}
        className={`${baseClasses} ${sizeClasses[size]} rounded-lg text-gray-700 hover:text-green-600 ${className}`}
        aria-label={ariaLabel}
        title={title}
      >
        <span>{title}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`${baseClasses} ${sizeClasses[size]} rounded-lg border border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-600 ${className}`}
      aria-label={ariaLabel}
      title={title}
    >
      <span>{title}</span>
    </button>
  );
};

export default RoleSwitcher;
