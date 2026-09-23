import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import Card from '@/shared/components/Card';
import Button from '@/shared/components/Button';
import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import TextArea from '@/shared/components/TextArea';
import Loading from '@/shared/components/Loading';
import PopupMessage from '@/shared/popups/PopupMessage';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';
import { useJobRoleValidations } from '@/validations/job-role-validations';
import ChevronDownIcon from '@/assets/icons/ChevronDown.svg';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { createRole, updateRole } from '@/redux/features/roles/rolesSlice';
import { permissionsApiService } from '@/services/api';
import type {
  Permission,
  PermissionGroup as ApiPermissionGroup,
} from '@/services/api/types/permissions.types';

const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
  <img
    src={ChevronDownIcon}
    alt=""
    aria-hidden="true"
    className={`h-4 w-4 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
  />
);

interface RoleCheckboxProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  name: string;
  labelClassName?: string;
}

const RoleCheckbox = ({
  checked,
  onChange,
  label,
  name,
  labelClassName = 'text-sm font-normal text-[#646969]',
}: RoleCheckboxProps) => (
  <label className="flex cursor-pointer items-center gap-3">
    <span className="relative flex h-6 w-6 items-center justify-center">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="peer h-6 w-6 appearance-none rounded-lg border border-[#DDE0E0] bg-white transition checked:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-hidden"
      />
      <svg
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none absolute hidden h-3.5 w-3.5 text-green-500 peer-checked:block"
      >
        <path
          d="M11.5 3.5L5.25 10L2.5 7.25"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
    <span className={labelClassName}>{label}</span>
  </label>
);

type PermissionAccess = 'view' | 'edit';

interface AccessRadioProps {
  name: string;
  value: PermissionAccess;
  current: PermissionAccess | null;
  label: string;
  disabled: boolean;
  onChange: (value: PermissionAccess) => void;
}

const AccessRadio = ({ name, value, current, label, disabled, onChange }: AccessRadioProps) => (
  <label
    dir="rtl"
    className={`flex items-center gap-2 ${
      disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
    }`}
  >
    <span className="text-sm font-normal text-[#646969]">{label}</span>
    <span className="relative flex h-4 w-4 items-center justify-center">
      <input
        type="radio"
        name={name}
        checked={!disabled && current === value}
        disabled={disabled}
        onChange={() => onChange(value)}
        className="peer h-4 w-4 appearance-none rounded-full border border-[#878F8F] checked:border-green-700 disabled:cursor-not-allowed"
      />
      <span className="pointer-events-none absolute hidden h-2 w-2 rounded-full bg-green-700 peer-checked:block" />
    </span>
  </label>
);

interface JobRoleFormValues {
  roleName: string;
  description: string;
}

interface PermissionSubject {
  key: string;
  name: string;
  viewId?: string;
  editId?: string;
}

interface PermissionUIGroup {
  id: string;
  name: string;
  subjects: PermissionSubject[];
}

type SelectedPermissionsMap = Record<string, { access: PermissionAccess }>;

const MODULE_LABELS: Record<string, { ar: string; en: string }> = {
  Dashboard: { ar: 'لوحة التحكم', en: 'Dashboard' },
  AcademicAffairs: { ar: 'الشؤون الأكاديمية', en: 'Academic Affairs' },
  LMS: { ar: 'التعليم الإلكتروني', en: 'LMS' },
  Calendar: { ar: 'التقويم', en: 'Calendar' },
  FinancialManagement: { ar: 'الإدارة المالية', en: 'Financial Management' },
  Settings: { ar: 'الإعدادات', en: 'Settings' },
  StudentMangment: { ar: 'إدارة الطلاب', en: 'Student Management' },
  SchoolTransportation: { ar: 'النقل المدرسي', en: 'School Transportation' },
  Staff: { ar: 'الكادر التوظيفي', en: 'Staff' },
};

const ACCESS_SUFFIX: Array<{ suffix: string; access: PermissionAccess }> = [
  { suffix: '.view', access: 'view' },
  { suffix: '.edit', access: 'edit' },
];

function splitCode(code: string): { baseKey: string; access: PermissionAccess } {
  for (const { suffix, access } of ACCESS_SUFFIX) {
    if (code.endsWith(suffix)) {
      return { baseKey: code.slice(0, -suffix.length), access };
    }
  }
  return { baseKey: code, access: 'view' };
}

function buildUIGroups(apiGroups: ApiPermissionGroup[], lang: 'ar' | 'en'): PermissionUIGroup[] {
  return apiGroups.map((group) => {
    const subjectsMap = new Map<string, PermissionSubject>();
    group.permissions.forEach((p) => {
      const { baseKey, access } = splitCode(p.code);
      const displayName = lang === 'ar' ? p.arabicName : p.englishName;
      const existing = subjectsMap.get(baseKey) ?? { key: baseKey, name: displayName };
      if (access === 'view') existing.viewId = p.id;
      else existing.editId = p.id;
      existing.name = displayName || existing.name;
      subjectsMap.set(baseKey, existing);
    });
    const moduleLabel = MODULE_LABELS[group.module]?.[lang] ?? group.module;
    return {
      id: group.module,
      name: moduleLabel,
      subjects: Array.from(subjectsMap.values()),
    };
  });
}

function buildSubjectIndex(
  apiGroups: ApiPermissionGroup[]
): Record<string, { access: PermissionAccess; key: string }> {
  const index: Record<string, { access: PermissionAccess; key: string }> = {};
  apiGroups.forEach((group) =>
    group.permissions.forEach((p) => {
      const { baseKey, access } = splitCode(p.code);
      index[p.id] = { access, key: baseKey };
    })
  );
  return index;
}

interface JobRoleFormProps {
  mode: 'add' | 'edit';
  initialData?: {
    id: string;
    name: string;
    description?: string | null;
    permissions?: Permission[];
  };
}

export default function JobRoleForm({ mode, initialData }: JobRoleFormProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const scrollToFirstError = useScrollToFirstError<JobRoleFormValues>();
  const { roleNameRules, descriptionRules, validatePermissions } = useJobRoleValidations();
  const currentLang = (i18n.language as 'ar' | 'en') ?? 'ar';

  const isCreating = useAppSelector((state) => state.roles.isCreating);
  const isUpdating = useAppSelector((state) => state.roles.isUpdating);
  const isSaving = mode === 'edit' ? isUpdating : isCreating;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobRoleFormValues>({
    defaultValues: { roleName: '', description: '' },
  });

  const [apiPermissionGroups, setApiPermissionGroups] = useState<ApiPermissionGroup[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
  const [selectedPermissions, setSelectedPermissions] = useState<SelectedPermissionsMap>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [permissionsError, setPermissionsError] = useState<string | undefined>();
  const [showPopupMessage, setShowPopupMessage] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
    isRaw: boolean;
  }>({ show: false, type: 'success', message: '', isRaw: false });

  useEffect(() => {
    let cancelled = false;
    const fetchPermissions = async () => {
      try {
        setIsLoadingPermissions(true);
        const response = await permissionsApiService.getPermissions({
          PageIndex: 1,
          PageSize: 1000,
          PermissionScope: 2,
        });
        if (cancelled) return;
        const groups = response.permissionGroupDtos ?? [];
        setApiPermissionGroups(groups);
        setExpandedGroups(groups.reduce((acc, g) => ({ ...acc, [g.module]: true }), {}));
      } catch {
        if (!cancelled) {
          setShowPopupMessage({
            show: true,
            type: 'error',
            message: t('rolesManagement.failedToLoadPermissions'),
            isRaw: true,
          });
        }
      } finally {
        if (!cancelled) setIsLoadingPermissions(false);
      }
    };
    fetchPermissions();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const uiGroups = useMemo(
    () => buildUIGroups(apiPermissionGroups, currentLang),
    [apiPermissionGroups, currentLang]
  );

  useEffect(() => {
    if (!initialData) return;
    reset({
      roleName: initialData.name ?? '',
      description: initialData.description ?? '',
    });
  }, [initialData, reset]);

  useEffect(() => {
    if (!initialData?.permissions?.length || apiPermissionGroups.length === 0) return;
    const subjectIndex = buildSubjectIndex(apiPermissionGroups);
    const next: SelectedPermissionsMap = {};
    initialData.permissions.forEach((p) => {
      const entry = subjectIndex[p.id];
      if (!entry) return;
      const existing = next[entry.key];
      if (entry.access === 'edit' || !existing) {
        next[entry.key] = { access: entry.access };
      }
    });
    setSelectedPermissions(next);
  }, [initialData, apiPermissionGroups]);

  const allSubjectKeys = useMemo(
    () => uiGroups.flatMap((g) => g.subjects.map((s) => s.key)),
    [uiGroups]
  );
  const isAllSelected =
    allSubjectKeys.length > 0 && allSubjectKeys.every((key) => selectedPermissions[key]);

  const clearPermissionsError = () => {
    if (permissionsError) setPermissionsError(undefined);
  };

  const defaultAccessForSubject = (subject: PermissionSubject): PermissionAccess =>
    subject.viewId ? 'view' : 'edit';

  const togglePermission = (subject: PermissionSubject) => {
    clearPermissionsError();
    setSelectedPermissions((prev) => {
      const next = { ...prev };
      if (next[subject.key]) {
        delete next[subject.key];
      } else {
        next[subject.key] = { access: defaultAccessForSubject(subject) };
      }
      return next;
    });
  };

  const setPermissionAccess = (subject: PermissionSubject, access: PermissionAccess) => {
    if (access === 'view' && !subject.viewId) return;
    if (access === 'edit' && !subject.editId) return;
    setSelectedPermissions((prev) => ({ ...prev, [subject.key]: { access } }));
  };

  const setGroupAccessForAll = (group: PermissionUIGroup, access: PermissionAccess) => {
    setSelectedPermissions((prev) => {
      const next = { ...prev };
      group.subjects.forEach((s) => {
        if (!next[s.key]) return;
        if (access === 'view' && !s.viewId) return;
        if (access === 'edit' && !s.editId) return;
        next[s.key] = { access };
      });
      return next;
    });
  };

  const isGroupFullyChecked = (group: PermissionUIGroup) =>
    group.subjects.length > 0 && group.subjects.every((s) => selectedPermissions[s.key]);

  const getGroupAccess = (group: PermissionUIGroup): PermissionAccess | null => {
    const accesses = group.subjects
      .map((s) => selectedPermissions[s.key]?.access)
      .filter((a): a is PermissionAccess => Boolean(a));
    if (accesses.length === 0) return null;
    return accesses.every((a) => a === accesses[0]) ? accesses[0] : null;
  };

  const toggleGroup = (group: PermissionUIGroup) => {
    clearPermissionsError();
    const allChecked = isGroupFullyChecked(group);
    setSelectedPermissions((prev) => {
      const next = { ...prev };
      group.subjects.forEach((s) => {
        if (allChecked) {
          delete next[s.key];
        } else if (!next[s.key]) {
          next[s.key] = { access: defaultAccessForSubject(s) };
        }
      });
      return next;
    });
  };

  const handleSelectAll = () => {
    clearPermissionsError();
    if (isAllSelected) {
      setSelectedPermissions({});
      return;
    }
    const next: SelectedPermissionsMap = {};
    uiGroups.forEach((group) =>
      group.subjects.forEach((s) => {
        next[s.key] = selectedPermissions[s.key] ?? { access: defaultAccessForSubject(s) };
      })
    );
    setSelectedPermissions(next);
  };

  const toggleExpand = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const collectPermissionIds = (): string[] => {
    const subjectsByKey = new Map<string, PermissionSubject>();
    uiGroups.forEach((g) => g.subjects.forEach((s) => subjectsByKey.set(s.key, s)));
    const ids: string[] = [];
    Object.entries(selectedPermissions).forEach(([key, { access }]) => {
      const subject = subjectsByKey.get(key);
      if (!subject) return;
      const preferredId = access === 'edit' ? subject.editId : subject.viewId;
      const fallbackId = access === 'edit' ? subject.viewId : subject.editId;
      const id = preferredId ?? fallbackId;
      if (id) ids.push(id);
    });
    return ids;
  };

  const onValid = async (values: JobRoleFormValues) => {
    const permissionIds = collectPermissionIds();
    const permissionsResult = validatePermissions(permissionIds.length);
    if (permissionsResult !== true) {
      setPermissionsError(permissionsResult);
      scrollToFirstError({ permissions: { message: permissionsResult } });
      return;
    }

    const schoolBrancheId = getCurrentSchoolBranchId();
    const payload = {
      roleName: values.roleName.trim(),
      description: values.description?.trim() || undefined,
      permissions: permissionIds,
      ...(schoolBrancheId ? { schoolBrancheId } : {}),
    };

    try {
      if (mode === 'edit' && initialData?.id) {
        await dispatch(updateRole({ roleId: initialData.id, ...payload })).unwrap();
      } else {
        await dispatch(createRole(payload)).unwrap();
      }
      setShowPopupMessage({
        show: true,
        type: 'success',
        message: t(
          mode === 'edit'
            ? 'rolesManagement.roleUpdatedSuccessfully'
            : 'rolesManagement.roleCreatedSuccessfully'
        ),
        isRaw: true,
      });
    } catch (error) {
      const rawMessage =
        typeof error === 'string'
          ? error
          : typeof error === 'object' && error && 'message' in error
            ? String((error as { message: unknown }).message)
            : null;
      const isRaw = Boolean(rawMessage) && rawMessage !== 'common.errorOccurred';
      setShowPopupMessage({
        show: true,
        type: 'error',
        message: isRaw ? (rawMessage as string) : t('common.errorOccurred'),
        isRaw,
      });
    }
  };

  if (isLoadingPermissions) {
    return (
      <Card padding="md">
        <Loading />
      </Card>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit(onValid, scrollToFirstError)} className="flex flex-col gap-6">
        <Card padding="md" className="flex flex-col gap-8">
          {/* Name field */}
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="flex-1">
              <FormField
                label={t('rolesManagement.roleName')}
                required
                htmlFor="roleName"
                name="roleName"
                error={errors.roleName?.message}
              >
                <Controller
                  name="roleName"
                  control={control}
                  rules={roleNameRules}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="roleName"
                      type="text"
                      placeholder={t('rolesManagement.enterRoleName')}
                    />
                  )}
                />
              </FormField>
            </div>
          </div>

          {/* Description field */}
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="flex-1">
              <FormField
                label={t('rolesManagement.description')}
                optional
                htmlFor="description"
                name="description"
                error={errors.description?.message}
              >
                <Controller
                  name="description"
                  control={control}
                  rules={descriptionRules}
                  render={({ field }) => (
                    <TextArea
                      {...field}
                      id="description"
                      placeholder={t('rolesManagement.enterRoleDescription')}
                      rows={3}
                    />
                  )}
                />
              </FormField>
            </div>
          </div>

          {/* Permissions */}
          <div className="flex flex-col gap-4" data-form-field="permissions">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-[#3A3A3A]">
                {t('rolesManagement.permissions')}
              </h3>
              <RoleCheckbox
                name="select-all"
                checked={isAllSelected}
                onChange={handleSelectAll}
                label={t('rolesManagement.selectAll')}
                labelClassName="text-base font-medium text-green-800"
              />
            </div>

            {permissionsError && (
              <p className="text-start text-sm text-red-500">{permissionsError}</p>
            )}

            <div className="flex flex-col gap-4">
              {uiGroups.map((group) => {
                const expanded = expandedGroups[group.id] ?? false;
                const groupAccess = getGroupAccess(group);
                const groupFullyChecked = isGroupFullyChecked(group);
                const groupHasView = group.subjects.some((s) => s.viewId);
                const groupHasEdit = group.subjects.some((s) => s.editId);
                return (
                  <div
                    key={group.id}
                    className="flex flex-col gap-4 rounded-2xl border border-[#DDE0E0] p-4"
                  >
                    {/* Group header */}
                    <div
                      className={`flex items-center justify-between gap-4 rounded-xl px-3 ${
                        expanded ? 'min-h-15 border border-[#E5FFF4] bg-[#EEFDF6] py-2' : 'min-h-6'
                      }`}
                    >
                      <RoleCheckbox
                        name={group.id}
                        checked={groupFullyChecked}
                        onChange={() => toggleGroup(group)}
                        label={group.name}
                        labelClassName="text-base font-normal text-black-900"
                      />
                      <div className="flex items-center gap-6">
                        {expanded && (
                          <>
                            <AccessRadio
                              name={`access-group-${group.id}`}
                              value="view"
                              current={groupAccess}
                              label={t('rolesManagement.viewOnly')}
                              disabled={!groupFullyChecked || !groupHasView}
                              onChange={(v) => setGroupAccessForAll(group, v)}
                            />
                            <AccessRadio
                              name={`access-group-${group.id}`}
                              value="edit"
                              current={groupAccess}
                              label={t('rolesManagement.edit')}
                              disabled={!groupFullyChecked || !groupHasEdit}
                              onChange={(v) => setGroupAccessForAll(group, v)}
                            />
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleExpand(group.id)}
                          aria-label={group.name}
                          className="flex shrink-0 items-center justify-center"
                        >
                          <ChevronIcon expanded={expanded} />
                        </button>
                      </div>
                    </div>

                    {/* Permission rows */}
                    {expanded && (
                      <div className="flex flex-col gap-2">
                        {group.subjects.map((subject) => {
                          const selected = selectedPermissions[subject.key];
                          const isChecked = Boolean(selected);
                          return (
                            <div
                              key={subject.key}
                              className="flex items-center justify-between gap-4 py-1"
                            >
                              <RoleCheckbox
                                name={subject.key}
                                checked={isChecked}
                                onChange={() => togglePermission(subject)}
                                label={subject.name}
                              />
                              <div className="flex items-center gap-6">
                                <AccessRadio
                                  name={`access-${subject.key}`}
                                  value="view"
                                  current={selected?.access ?? defaultAccessForSubject(subject)}
                                  label={t('rolesManagement.viewOnly')}
                                  disabled={!isChecked || !subject.viewId}
                                  onChange={(v) => setPermissionAccess(subject, v)}
                                />
                                <AccessRadio
                                  name={`access-${subject.key}`}
                                  value="edit"
                                  current={selected?.access ?? defaultAccessForSubject(subject)}
                                  label={t('rolesManagement.edit')}
                                  disabled={!isChecked || !subject.editId}
                                  onChange={(v) => setPermissionAccess(subject, v)}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/settings/job-roles')}
              disabled={isSaving}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="success" disabled={isSaving}>
              {isSaving ? t('common.saving') : mode === 'edit' ? t('common.save') : t('common.add')}
            </Button>
          </div>
        </Card>
      </form>

      <PopupMessage
        open={showPopupMessage.show}
        type={showPopupMessage.type}
        iconSrc={showPopupMessage.type === 'success' ? BigSuccessIcon : XMarkDangerIcon}
        message={showPopupMessage.message}
        isMessageRaw={showPopupMessage.isRaw}
        onClose={() => {
          const wasSuccess = showPopupMessage.type === 'success';
          setShowPopupMessage({ show: false, type: 'success', message: '', isRaw: false });
          if (wasSuccess) {
            navigate('/settings/job-roles');
          }
        }}
      />
    </>
  );
}
