export const RequestStatus = {
  idle: 0,
  loading: 1,
  succeeded: 2,
  failed: 3,
} as const;
export type RequestStatus = typeof RequestStatus[keyof typeof RequestStatus];


export const ResponseStatus = {
  FailedToSave: 0,
  SavedSuccessfully: 1,
  Exception: 2,
  Success: 3,
  Failed: 4,
  FailedToFindTheObject: 5,
  AlreadyExisting: 6,
} as const;
export type ResponseStatus = typeof ResponseStatus[keyof typeof ResponseStatus];


export const StatusENum = {
  Draft: 1,
  Published: 2,
} as const;
export type StatusENum = typeof StatusENum[keyof typeof StatusENum];


export const State = {
  NotDeleted: 0,
  Deleted: 1,
} as const;
export type State = typeof State[keyof typeof State];


export const Days = {
  Sunday: 1,
  Monday: 2,
  Tuesday: 3,
  Wednesday: 4,
  Thursday: 5,
  Friday: 6,
  Saturday: 7
} as const;
export type Days = typeof Days[keyof typeof Days];

export const MonthlyCalendarDuration = {
  Day: 1,
  SpecificTime: 2,
} as const;
export type MonthlyCalendarDuration =
  typeof MonthlyCalendarDuration[keyof typeof MonthlyCalendarDuration];


export const OfferApplyOn = {
  ApplicationFees: 1,
  TuitionFees: 2,
  Both: 3,
} as const;
export type OfferApplyOn = typeof OfferApplyOn[keyof typeof OfferApplyOn];


export const OfferField = {
  // ===============================
  // 🎓 الطالب / الملف الدراسي
  // ===============================
  StudentId: 1,
  GradeId: 2,
  StageId: 3,
  ClassroomId: 4,

  IsNewStudent: 10,
  HasSibling: 11, // true
  SiblingsCount: 12,

  Gender: 13,
  NationalityId: 14,
  BirthYear: 15,

  // ===============================
  // 💰 المصروفات / الرسوم
  // ===============================
  TuitionAmount: 50,
  ApplicationFeesAmount: 51,
  RemainingAmount: 52,

  InstallmentsCount: 53,
  IsInstallment: 54,

  PaidAmount: 55,

  // ===============================
  // 🧾 الخدمات
  // ===============================
  PaidServiceId: 73,

  // ===============================
  // 💳 الدفع
  // ===============================
  PaymentMethodId: 90,
  PaymentMethodType: 91,
  PaymentDate: 92,
  DueDate: 93,

  IsFullPayment: 94, // true
  IsEarlyPayment: 95, // true

  AlwaysTrue: 200, // true // عرض عام بدون شروط
} as const;
export type OfferField = typeof OfferField[keyof typeof OfferField];


export const OfferOperator = {
  Equals: 1,
  NotEquals: 2,

  GreaterThan: 3,
  GreaterThanOrEqual: 4,
  LessThan: 5,
  LessThanOrEqual: 6,

  In: 7,
  NotIn: 8,

  Between: 9,
} as const;
export type OfferOperator = typeof OfferOperator[keyof typeof OfferOperator];


export const InvoicePaymentType = {
  Cash: 1,
  Deferred: 2,
} as const;
export type InvoicePaymentType = typeof InvoicePaymentType[keyof typeof InvoicePaymentType];


export const DelegationDurationType = {
  Permanent: 1, // دائم
  Temporary: 2, // مؤقت
} as const;
export type DelegationDurationType =
  typeof DelegationDurationType[keyof typeof DelegationDurationType];


export const DelegationPersonType = {
  Father: 1, // والد
  Mother: 2, // والدة
  Driver: 3, // سائق
  BuildingGuard: 4, // حارس العقار
  Nanny: 5, // مربية
  Other: 6, // أخرى
} as const;
export type DelegationPersonType =
  typeof DelegationPersonType[keyof typeof DelegationPersonType];
