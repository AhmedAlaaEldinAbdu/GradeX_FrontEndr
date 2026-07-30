
export const FeatureAccess = {
    HIDE: 'hide',
    VIEW: 'view',
    EDIT: 'edit',
} as const;

export type FeatureAccess =
    (typeof FeatureAccess)[keyof typeof FeatureAccess];

export const featurePermissions = {
    dashboard: FeatureAccess.EDIT,
    educationalStages: {
        stagesClassrooms: FeatureAccess.VIEW,
        subjects: FeatureAccess.VIEW,
        books: FeatureAccess.VIEW,
    },
    eLearning: {
        overview: FeatureAccess.VIEW,
        liveClasses: FeatureAccess.VIEW,
        onlineExams: FeatureAccess.VIEW,
        trainingCourses: FeatureAccess.VIEW,
        assignmentsTasks: FeatureAccess.VIEW,
        lessonPresentation: FeatureAccess.VIEW,
    },
    academicCalendar: {
        weeklyCalendar: FeatureAccess.VIEW,
        monthlyCalendar: FeatureAccess.VIEW,
        yearlyCalendar: FeatureAccess.VIEW,
    },
    studentManagement: {
        studentsRecord: FeatureAccess.EDIT,
        attendanceDeparture: FeatureAccess.VIEW,
        registrationAnnouncement: FeatureAccess.EDIT,
        interviews: FeatureAccess.EDIT,
    },
    requests: {
        applications: FeatureAccess.EDIT,
        earlyLeaveRequest: FeatureAccess.VIEW,
        messages: FeatureAccess.VIEW,
        reminder: FeatureAccess.VIEW,
    },
    schoolTransport: {
        buses: FeatureAccess.HIDE,
        drivers: FeatureAccess.HIDE,
    },
    teachingStaff: {
        employees: FeatureAccess.EDIT,
        jobAnnouncement: FeatureAccess.EDIT,
        interviews: FeatureAccess.EDIT,
    },
    attendanceDeparture: FeatureAccess.VIEW,
    adminRequests: {
        jobApplication: FeatureAccess.EDIT,
        applicationArchive: FeatureAccess.EDIT,
        earlyLeaveRequest: FeatureAccess.VIEW,
        messages: FeatureAccess.VIEW,
        notes: FeatureAccess.VIEW,
    },
    financialManagement: {
        transactions: {
            overview: FeatureAccess.VIEW,
            transactions: FeatureAccess.VIEW,
        },
        tuitionFees: {
            tuitionFees: FeatureAccess.EDIT,
            discountsOffers: FeatureAccess.EDIT,
        },
        invoices: FeatureAccess.VIEW,
        customers: FeatureAccess.VIEW,
        contracts: FeatureAccess.VIEW,
    },
    tools: {
        studio: FeatureAccess.HIDE,
        reports: FeatureAccess.HIDE,
    },
    systemSettings: {
        schoolData: FeatureAccess.EDIT,
        jobRoles: {
            rolesPermissions: FeatureAccess.HIDE,
            systemUsers: FeatureAccess.HIDE,
        },
        paymentChannels: FeatureAccess.HIDE,
        holidaysSettings: FeatureAccess.HIDE,
        siteSettings: FeatureAccess.HIDE,
        notifications: {
            employees: FeatureAccess.EDIT,
            parents: FeatureAccess.EDIT,
        }
    }
};
