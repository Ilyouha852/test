// Временные типы, так как Prisma не сгенерирован
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  hashedPassword: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfileCreateInput {
  email: string;
  name?: string;
  hashedPassword: string;
}

export interface UserProfileUpdateInput {
  email?: string;
  name?: string;
  hashedPassword?: string;
}

// Заглушка вместо реальной базы данных
const mockUserProfiles: UserProfile[] = [];

/* CREATE */

/**
 * Сохраняет профиль пользователя в БД.
 *
 * @param userProfile Профиль пользователя для сохранения.
 * @returns Сохраненный профиль пользователя.
 */
export async function saveUserProfileToDatabase(
  userProfile: UserProfileCreateInput,
): Promise<UserProfile> {
  const newProfile: UserProfile = {
    id: `user_${Date.now()}`,
    email: userProfile.email,
    name: userProfile.name || '',
    hashedPassword: userProfile.hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  mockUserProfiles.push(newProfile);
  return newProfile;
}

/* READ */

/**
 * Извлекает профиль пользователя по его id.
 *
 * @param id Идентификатор профиля пользователя.
 * @returns Профиль пользователя или `null`.
 */
export async function retrieveUserProfileFromDatabaseById(
  id: string,
): Promise<UserProfile | null> {
  return mockUserProfiles.find(profile => profile.id === id) || null;
}

/**
 * Извлекает профиль пользователя по его email.
 *
 * @param email email профиля пользователя.
 * @returns Профиль пользователя или `null`.
 */
export async function retrieveUserProfileFromDatabaseByEmail(
  email: string,
): Promise<UserProfile | null> {
  return mockUserProfiles.find(profile => profile.email === email) || null;
}

/**
 * Извлекает несколько профилей пользователей.
 *
 * @param page Номер страницы (начиная с 1).
 * @param pageSize Количество профилей на страницу.
 * @returns Список профилей пользователей.
 */
export async function retrieveManyUserProfilesFromDatabase({
  page = 1,
  pageSize = 10,
}: {
  page?: number;
  pageSize?: number;
}): Promise<UserProfile[]> {
  const skip = (page - 1) * pageSize;
  return mockUserProfiles
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(skip, skip + pageSize);
}

/* UPDATE */

/**
 * Обновляет профиль пользователя по его id.
 *
 * @param id Идентификатор профиля пользователя.
 * @param data Новые данные профиля.
 * @returns Обновленный профиль пользователя.
 */
export async function updateUserProfileInDatabaseById({
  id,
  data,
}: {
  id: string;
  data: UserProfileUpdateInput;
}): Promise<UserProfile | null> {
  const index = mockUserProfiles.findIndex(profile => profile.id === id);
  if (index === -1) return null;
  
  mockUserProfiles[index] = {
    ...mockUserProfiles[index],
    ...data,
    updatedAt: new Date(),
  };
  
  return mockUserProfiles[index];
}

/* DELETE */

/**
 * Удаляет профиль пользователя по его id.
 *
 * @param id Идентификатор профиля пользователя.
 * @returns Удаленный профиль пользователя.
 */
export async function deleteUserProfileFromDatabaseById(id: string): Promise<UserProfile | null> {
  const index = mockUserProfiles.findIndex(profile => profile.id === id);
  if (index === -1) return null;
  
  return mockUserProfiles.splice(index, 1)[0];
}