export const MY_ROUTES = {
    main: 'main',
    home: '',
    secretaryPages: {
        base: 'secretary',
        enrollment: {
            base: 'enrollments',
            absolute: '/main/secretary/enrollments',
            detail: {
                base: 'enrollment-details',
                // absolute is dynamic: /main/secretary/enrollments/:enrollmentId/enrollment-details
                absoluteFn: (enrollmentId: string) =>
                    `/main/secretary/enrollments/${enrollmentId}/enrollment-details`,
            },
            form: {
                // absolute is dynamic: /main/secretary/enrollments/:enrollmentId/enrollment-details/:id
                absoluteFn: (enrollmentId: string, id: string = 'new') =>
                    `/main/secretary/enrollments/${enrollmentId}/enrollment-details/${id}`,
            },
        }
    },
};
