// Заглушка для базы данных - подключим позже
export const prisma = {
    userProfile: {
        findMany: () => Promise.resolve([]),
        findUnique: () => Promise.resolve(null),
        create: (data: any) => Promise.resolve({ id: '1', ...data }),
        update: () => Promise.resolve(null),
        delete: () => Promise.resolve(null),
    },
};
