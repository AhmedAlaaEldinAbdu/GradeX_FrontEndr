import { BackendRole } from '@/constants/roles';
import { logger } from '@/lib/utils/logger';
import type { User } from '@/redux/features/auth/authTypes';

export const SchoolAccessLevel = {
  VIEW: 'view',
  EDIT: 'edit',
} as const;

export type SchoolAccessLevelType = (typeof SchoolAccessLevel)[keyof typeof SchoolAccessLevel];

export const SchoolActionKind = {
  READ: 'read',
  MUTATION: 'mutation',
} as const;

export type SchoolActionKindType = (typeof SchoolActionKind)[keyof typeof SchoolActionKind];

/**
 * Add new business action keys here. Shared controls ask this registry whether
 * an action reads data or mutates it.
 */
export const SCHOOL_ACTIONS = {
  view: SchoolActionKind.READ,
  details: SchoolActionKind.READ,
  preview: SchoolActionKind.READ,
  download: SchoolActionKind.READ,
  export: SchoolActionKind.READ,
  exportPdf: SchoolActionKind.READ,
  exportExcel: SchoolActionKind.READ,
  print: SchoolActionKind.READ,
  open: SchoolActionKind.READ,
  show: SchoolActionKind.READ,
  reload: SchoolActionKind.READ,
  refresh: SchoolActionKind.READ,
  add: SchoolActionKind.MUTATION,
  edit: SchoolActionKind.MUTATION,
  delete: SchoolActionKind.MUTATION,
  create: SchoolActionKind.MUTATION,
  submit: SchoolActionKind.MUTATION,
  approve: SchoolActionKind.MUTATION,
  accept: SchoolActionKind.MUTATION,
  reject: SchoolActionKind.MUTATION,
  archive: SchoolActionKind.MUTATION,
  assign: SchoolActionKind.MUTATION,
  upload: SchoolActionKind.MUTATION,
  schedule: SchoolActionKind.MUTATION,
  reply: SchoolActionKind.MUTATION,
  markViewed: SchoolActionKind.MUTATION,
  recover: SchoolActionKind.MUTATION,
  start: SchoolActionKind.MUTATION,
  issue: SchoolActionKind.MUTATION,
  correction: SchoolActionKind.MUTATION,
} as const satisfies Record<string, SchoolActionKindType>;

export type SchoolActionKey = keyof typeof SCHOOL_ACTIONS;

/**
 * These read actions are denied for view-only SchoolOwners unless the active
 * feature explicitly enables them through `allowedViewActions`.
 */
export const SCHOOL_RESTRICTED_VIEW_ACTIONS = [
  'reload',
  'print',
  'export',
  'exportPdf',
  'exportExcel',
] as const satisfies readonly SchoolActionKey[];

export type SchoolRestrictedViewActionKey = (typeof SCHOOL_RESTRICTED_VIEW_ACTIONS)[number];

export type SchoolControlType = 'button' | 'icon-button' | 'menu' | 'page-header';

export interface SchoolActionContext {
  control: SchoolControlType;
  actionKey?: SchoolActionKey;
  actionId?: string;
  destination?: string;
  buttonType?: 'button' | 'submit' | 'reset';
  variant?: string;
  status?: string;
}

interface SchoolFeatureDefinition {
  ownerAccess: SchoolAccessLevelType;
  listPath: string;
  exactRoutes?: readonly string[];
  routePrefixes?: readonly string[];
  tabRoute?: {
    path: string;
    param: string;
    value: string;
    default?: boolean;
  };
  mutationRoutePatterns?: readonly RegExp[];
  allowedViewActions?: readonly SchoolRestrictedViewActionKey[];
}

/**
 * Single frontend permission registry for school features.
 *
 * When backend permissions become available, replace `ownerAccess` in the
 * permission-source boundary below while keeping route/action consumers intact.
 */
export const SCHOOL_FEATURES = {
  dashboard: {
    ownerAccess: SchoolAccessLevel.EDIT,
    listPath: '/dashboard',
    routePrefixes: ['/dashboard'],
  },
  educationalStagesGrades: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/classrooms',
    routePrefixes: ['/classrooms', '/educational-stages'],
    mutationRoutePatterns: [/^\/classrooms\/(?:add-classroom|edit-classroom)(?:\/|$)/],
  },
  subjects: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/subjects',
    routePrefixes: ['/subjects'],
    mutationRoutePatterns: [/^\/subjects\/(?:add|edit)(?:\/|$)/],
  },
  books: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/books',
    routePrefixes: ['/books'],
    mutationRoutePatterns: [/^\/books\/(?:add|edit)(?:\/|$)/],
  },
  examResults: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/exam-results',
    exactRoutes: ['/exam-results'],
  },
  lmsOverview: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/lms/overview',
    routePrefixes: ['/lms/overview'],
  },
  liveClasses: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/lms/live-classes',
    routePrefixes: ['/lms/live-classes'],
    mutationRoutePatterns: [
      /^\/lms\/live-classes\/add(?:\/|$)/,
      /^\/lms\/live-classes\/[^/]+\/edit(?:\/|$)/,
    ],
  },
  onlineExams: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/lms/online-exams',
    routePrefixes: ['/lms/online-exams'],
    mutationRoutePatterns: [/^\/lms\/online-exams\/create(?:\/|$)/],
  },
  trainingCourses: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/lms/courses',
    routePrefixes: ['/lms/courses'],
    mutationRoutePatterns: [/^\/lms\/courses\/add(?:\/|$)/, /^\/lms\/courses\/[^/]+\/edit(?:\/|$)/],
  },
  questionBank: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/lms/question-bank',
    exactRoutes: ['/lms/question-bank'],
  },
  assignmentsTasks: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/calendar/tasks',
    routePrefixes: ['/calendar/tasks'],
    mutationRoutePatterns: [
      /^\/calendar\/tasks\/add-task(?:\/|$)/,
      /^\/calendar\/tasks\/edit(?:\/|$)/,
      /^\/calendar\/tasks\/details\/[^/]+\/(?:correction|edit-correction)\/[^/]+(?:\/|$)/,
    ],
  },
  lessonPreparation: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/calendar/preparations',
    routePrefixes: ['/calendar/preparations'],
    mutationRoutePatterns: [
      /^\/calendar\/preparations\/(?:add-preparation|edit-preparation)(?:\/|$)/,
    ],
  },
  academicCalendar: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/calendar/academic',
    routePrefixes: ['/calendar/academic'],
    mutationRoutePatterns: [
      /^\/calendar\/academic\/(?:add-academic-calendar|edit-academic-calendar)(?:\/|$)/,
    ],
  },
  monthlyCalendar: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/calendar/monthly',
    routePrefixes: ['/calendar/monthly'],
  },
  weeklyCalendar: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/calendar/weekly',
    routePrefixes: ['/calendar/weekly'],
    mutationRoutePatterns: [/^\/calendar\/weekly\/(?:add|edit)(?:\/|$)/],
  },
  studentsRecord: {
    ownerAccess: SchoolAccessLevel.EDIT,
    listPath: '/students-record',
    routePrefixes: ['/students-record', '/students/student-details'],
  },
  registrationAnnouncement: {
    ownerAccess: SchoolAccessLevel.EDIT,
    listPath: '/registration-announcement',
    routePrefixes: ['/registration-announcement'],
    mutationRoutePatterns: [
      /^\/registration-announcement\/(?:add-registration-announcement|edit-registration-announcement)(?:\/|$)/,
    ],
  },
  studentInterviews: {
    ownerAccess: SchoolAccessLevel.EDIT,
    listPath: '/student-interviews',
    routePrefixes: ['/student-interviews'],
  },
  studentAttendance: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/students/attendance',
    routePrefixes: ['/students/attendance'],
    tabRoute: {
      path: '/attendance',
      param: 'tab',
      value: 'students',
      default: true,
    },
  },
  studentApplications: {
    ownerAccess: SchoolAccessLevel.EDIT,
    listPath: '/requests?tab=applications',
    routePrefixes: ['/requests/student-applications-details'],
    tabRoute: {
      path: '/requests',
      param: 'tab',
      value: 'applications',
      default: true,
    },
  },
  earlyLeaveRequests: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/requests?tab=early-leave',
    routePrefixes: ['/requests/early-leave'],
    tabRoute: {
      path: '/requests',
      param: 'tab',
      value: 'early-leave',
    },
    mutationRoutePatterns: [/^\/requests\/early-leave\/[^/]+\/edit(?:\/|$)/],
  },
  messages: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/requests?tab=messages',
    routePrefixes: ['/requests/view-message', '/requests/add-message'],
    tabRoute: {
      path: '/requests',
      param: 'tab',
      value: 'messages',
    },
    mutationRoutePatterns: [/^\/requests\/add-message(?:\/|$)/],
  },
  reminders: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/requests?tab=reminder',
    tabRoute: {
      path: '/requests',
      param: 'tab',
      value: 'reminder',
    },
  },
  buses: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/bus-management/bus',
    exactRoutes: ['/bus-management/bus'],
  },
  drivers: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/bus-management/drivers',
    exactRoutes: ['/bus-management/drivers'],
  },
  teachingStaff: {
    ownerAccess: SchoolAccessLevel.EDIT,
    listPath: '/teaching-staff',
    routePrefixes: ['/teaching-staff', '/teachers', '/administrators'],
    mutationRoutePatterns: [
      /^\/teachers\/[^/]+\/add-placement(?:\/|$)/,
      /^\/teaching-staff\/teachers\/[^/]+\/edit-placement(?:\/|$)/,
    ],
  },
  jobAnnouncements: {
    ownerAccess: SchoolAccessLevel.EDIT,
    listPath: '/job-announcements',
    routePrefixes: ['/job-announcements'],
    mutationRoutePatterns: [
      /^\/job-announcements\/(?:add-job-announcements|edit-job-announcement)(?:\/|$)/,
    ],
  },
  staffInterviews: {
    ownerAccess: SchoolAccessLevel.EDIT,
    listPath: '/interviews',
    routePrefixes: ['/interviews'],
  },
  employeeAttendance: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/employees/attendance',
    routePrefixes: ['/employees/attendance'],
    tabRoute: {
      path: '/attendance',
      param: 'tab',
      value: 'employees',
    },
  },
  adminApplications: {
    ownerAccess: SchoolAccessLevel.EDIT,
    listPath: '/admin-requests?tab=job-application',
    routePrefixes: ['/admin-requests/job-application'],
    tabRoute: {
      path: '/admin-requests',
      param: 'tab',
      value: 'job-application',
      default: true,
    },
  },
  adminApplicationsArchive: {
    ownerAccess: SchoolAccessLevel.EDIT,
    listPath: '/admin-requests?tab=application-archive',
    tabRoute: {
      path: '/admin-requests',
      param: 'tab',
      value: 'application-archive',
    },
  },
  adminEarlyLeaveRequests: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/admin-requests?tab=early-leave',
    tabRoute: {
      path: '/admin-requests',
      param: 'tab',
      value: 'early-leave',
    },
  },
  adminMessages: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/admin-requests?tab=messages',
    tabRoute: {
      path: '/admin-requests',
      param: 'tab',
      value: 'messages',
    },
  },
  adminNotes: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/admin-requests?tab=notes',
    tabRoute: {
      path: '/admin-requests',
      param: 'tab',
      value: 'notes',
    },
  },
  transactions: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/financial-management/transactions',
    routePrefixes: ['/financial-management/transactions'],
  },
  tuitionFeesOffers: {
    ownerAccess: SchoolAccessLevel.EDIT,
    listPath: '/financial-management/fees',
    routePrefixes: ['/financial-management/fees'],
    mutationRoutePatterns: [
      /^\/financial-management\/fees\/(?:add-tuition-fee|edit-tuition-fee)(?:\/|$)/,
      /^\/financial-management\/fees\/(?:add-discount-offer|edit-discount-offer)(?:\/|$)/,
    ],
  },
  invoices: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/financial-management/invoices',
    routePrefixes: ['/financial-management/invoices'],
    mutationRoutePatterns: [/^\/financial-management\/invoices\/issue(?:\/|$)/],
  },
  customers: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/financial-management/customers',
    routePrefixes: ['/financial-management/customers'],
    mutationRoutePatterns: [
      /^\/financial-management\/customers\/(?:add-client|edit-client)(?:\/|$)/,
    ],
  },
  contracts: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/financial-management/contracts',
    routePrefixes: ['/financial-management/contracts'],
    mutationRoutePatterns: [
      /^\/financial-management\/contracts\/(?:add-contract|edit-contract)(?:\/|$)/,
    ],
  },
  studio: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/studio',
    exactRoutes: ['/studio'],
  },
  reports: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/reports',
    exactRoutes: ['/reports'],
  },
  generalNotifications: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/notifications',
    exactRoutes: ['/notifications'],
  },
  settingsOverview: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/settings',
    exactRoutes: ['/settings'],
  },
  schoolData: {
    ownerAccess: SchoolAccessLevel.EDIT,
    listPath: '/settings/school-data',
    routePrefixes: ['/settings/school-data'],
    mutationRoutePatterns: [/^\/settings\/school-data\/edit(?:\/|$)/],
  },
  jobRoles: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/settings/job-roles',
    routePrefixes: ['/settings/job-roles'],
    mutationRoutePatterns: [
      /^\/settings\/job-roles\/(?:add-role|edit-role|add-user|edit-user)(?:\/|$)/,
    ],
  },
  paymentChannels: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/settings/payment-channels',
    exactRoutes: ['/settings/payment-channels'],
  },
  holidaysSettings: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/settings/holidays',
    exactRoutes: ['/settings/holidays'],
  },
  siteSettings: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/settings/site',
    exactRoutes: ['/settings/site'],
  },
  notifications: {
    ownerAccess: SchoolAccessLevel.VIEW,
    listPath: '/settings/notifications',
    routePrefixes: ['/settings/notifications'],
    mutationRoutePatterns: [/^\/settings\/notifications\/(?:employees|parents)\/add(?:\/|$)/],
  },
} as const satisfies Record<string, SchoolFeatureDefinition>;

export type SchoolFeatureKey = keyof typeof SCHOOL_FEATURES;

export interface SchoolPermissionSnapshot {
  featureAccess: Partial<Record<SchoolFeatureKey, SchoolAccessLevelType>>;
  viewActionAccess?: Partial<
    Record<SchoolFeatureKey, Partial<Record<SchoolRestrictedViewActionKey, boolean>>>
  >;
}

const schoolFeatureEntries = Object.entries(SCHOOL_FEATURES) as Array<
  [SchoolFeatureKey, SchoolFeatureDefinition]
>;

const warnedAccessKeys = new Set<string>();

const warnOnce = (key: string, message: string, data?: unknown) => {
  if (warnedAccessKeys.has(key)) return;
  warnedAccessKeys.add(key);
  logger.warn(message, data);
};

const normalizeBackendRole = (role?: string): string =>
  String(role ?? '')
    .trim()
    .toLowerCase();

/**
 * This is the only permission-source boundary. A backend permission response can
 * replace the static access value here without changing feature components.
 */
export const resolveSchoolAccess = (
  featureKey: SchoolFeatureKey | string | null | undefined,
  user: User | null,
  permissionSnapshot: SchoolPermissionSnapshot | null = null
): SchoolAccessLevelType => {
  const backendRole = normalizeBackendRole(user?.backendRole);

  if (backendRole === BackendRole.SCHOOL_ADMIN.toLowerCase()) {
    return SchoolAccessLevel.EDIT;
  }

  if (backendRole !== BackendRole.SCHOOL_OWNER.toLowerCase()) {
    warnOnce('unknown-backend-role', 'Unknown or missing backend role; allowing full access', {
      backendRole: user?.backendRole,
    });
    return SchoolAccessLevel.EDIT;
  }

  if (!featureKey || !(featureKey in SCHOOL_FEATURES)) {
    warnOnce(
      `unknown-school-owner-feature:${featureKey ?? 'none'}`,
      'SchoolOwner feature is not configured; defaulting to view-only access',
      { featureKey }
    );
    return SchoolAccessLevel.VIEW;
  }

  const backendAccess = permissionSnapshot?.featureAccess[featureKey as SchoolFeatureKey];
  if (backendAccess) {
    return backendAccess;
  }

  return SCHOOL_FEATURES[featureKey as SchoolFeatureKey].ownerAccess;
};

export const resolveSchoolFeatureFromLocation = (
  pathname: string,
  search = ''
): SchoolFeatureKey | null => {
  const params = new URLSearchParams(search);

  const tabMatch = schoolFeatureEntries.find(([, feature]) => {
    const tabRoute = feature.tabRoute;
    if (!tabRoute || pathname !== tabRoute.path) return false;

    const selectedTab = params.get(tabRoute.param);
    return selectedTab === tabRoute.value || (!selectedTab && tabRoute.default === true);
  });

  if (tabMatch) return tabMatch[0];

  const exactMatch = schoolFeatureEntries.find(([, feature]) =>
    feature.exactRoutes?.includes(pathname)
  );

  if (exactMatch) return exactMatch[0];

  return (
    schoolFeatureEntries.find(([, feature]) =>
      feature.routePrefixes?.some((prefix) => pathname.startsWith(prefix))
    )?.[0] ?? null
  );
};

const fallbackMutationRoutePatterns = [
  /\/add(?:-|\/|$)/,
  /\/edit(?:-|\/|$)/,
  /\/create(?:\/|$)/,
  /\/issue(?:\/|$)/,
  /\/correction(?:\/|$)/,
];

export const isSchoolMutationPath = (path: string): boolean => {
  const [pathname, search = ''] = path.split('?');
  const featureKey = resolveSchoolFeatureFromLocation(pathname, search ? `?${search}` : '');
  const featurePatterns = featureKey
    ? (SCHOOL_FEATURES[featureKey] as SchoolFeatureDefinition).mutationRoutePatterns
    : undefined;

  return (
    featurePatterns?.some((pattern) => pattern.test(pathname)) === true ||
    fallbackMutationRoutePatterns.some((pattern) => pattern.test(pathname))
  );
};

const normalizeActionId = (actionId: string): string =>
  actionId
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();

const schoolActionEntries = Object.entries(SCHOOL_ACTIONS) as Array<
  [SchoolActionKey, SchoolActionKindType]
>;

const resolveActionKeyFromId = (actionId: string): SchoolActionKey | null => {
  const normalizedActionId = normalizeActionId(actionId);
  const exactActionEntry = schoolActionEntries.find(
    ([actionKey]) => normalizedActionId === normalizeActionId(actionKey)
  );

  if (exactActionEntry) return exactActionEntry[0];

  return (
    schoolActionEntries.find(([actionKey]) => {
      const normalizedActionKey = normalizeActionId(actionKey);
      return (
        normalizedActionId.startsWith(`${normalizedActionKey}-`) ||
        normalizedActionId.includes(`-${normalizedActionKey}-`) ||
        normalizedActionId.endsWith(`-${normalizedActionKey}`)
      );
    })?.[0] ?? null
  );
};

export const resolveSchoolActionKey = ({
  actionKey,
  actionId,
}: SchoolActionContext): SchoolActionKey | null => {
  if (actionKey) return actionKey;
  return actionId ? resolveActionKeyFromId(actionId) : null;
};

export const resolveSchoolActionKind = ({
  control,
  actionKey,
  actionId,
  destination,
  buttonType = 'button',
  variant,
  status,
}: SchoolActionContext): SchoolActionKindType => {
  if (actionKey) {
    return SCHOOL_ACTIONS[actionKey];
  }

  if (destination) {
    return isSchoolMutationPath(destination) ? SchoolActionKind.MUTATION : SchoolActionKind.READ;
  }

  if (actionId) {
    const resolvedActionKey = resolveActionKeyFromId(actionId);
    if (resolvedActionKey) return SCHOOL_ACTIONS[resolvedActionKey];
  }

  if (control === 'menu') {
    return SchoolActionKind.MUTATION;
  }

  if (control === 'page-header') {
    return variant === 'ghost' ? SchoolActionKind.READ : SchoolActionKind.MUTATION;
  }

  if (control === 'icon-button') {
    return status || variant === 'success' || variant === 'danger'
      ? SchoolActionKind.MUTATION
      : SchoolActionKind.READ;
  }

  return buttonType === 'submit' || variant === 'success' || variant === 'danger'
    ? SchoolActionKind.MUTATION
    : SchoolActionKind.READ;
};

export const isSchoolMutationAction = (context: SchoolActionContext): boolean =>
  resolveSchoolActionKind(context) === SchoolActionKind.MUTATION;

const restrictedViewActionKeys = new Set<SchoolActionKey>(SCHOOL_RESTRICTED_VIEW_ACTIONS);

interface CanPerformSchoolActionOptions {
  featureKey: SchoolFeatureKey | null;
  access: SchoolAccessLevelType;
  action: SchoolActionContext;
  permissionSnapshot?: SchoolPermissionSnapshot | null;
}

export const canPerformSchoolAction = ({
  featureKey,
  access,
  action,
  permissionSnapshot = null,
}: CanPerformSchoolActionOptions): boolean => {
  if (access === SchoolAccessLevel.EDIT) return true;
  if (isSchoolMutationAction(action)) return false;

  const actionKey = resolveSchoolActionKey(action);
  if (!actionKey || !restrictedViewActionKeys.has(actionKey)) return true;
  if (!featureKey) return false;

  const backendActionAccess =
    permissionSnapshot?.viewActionAccess?.[featureKey]?.[
      actionKey as SchoolRestrictedViewActionKey
    ];

  if (typeof backendActionAccess === 'boolean') {
    return backendActionAccess;
  }

  const feature = SCHOOL_FEATURES[featureKey] as SchoolFeatureDefinition;
  return feature.allowedViewActions?.includes(actionKey as SchoolRestrictedViewActionKey) === true;
};

export const getSchoolFeatureListPath = (featureKey: SchoolFeatureKey | null): string =>
  featureKey ? SCHOOL_FEATURES[featureKey].listPath : '/dashboard';
