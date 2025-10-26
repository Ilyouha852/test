// Временные типы и заглушка вместо реальной базы данных
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
export async function retrieveUserProfileFromDatabaseById(
  id: string,
): Promise<UserProfile | null> {
  return mockUserProfiles.find(profile => profile.id === id) || null;
}

export async function retrieveUserProfileFromDatabaseByEmail(
  email: string,
): Promise<UserProfile | null> {
  return mockUserProfiles.find(profile => profile.email === email) || null;
}

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
export async function deleteUserProfileFromDatabaseById(id: string): Promise<UserProfile | null> {
  const index = mockUserProfiles.findIndex(profile => profile.id === id);
  if (index === -1) return null;
  
  return mockUserProfiles.splice(index, 1)[0];
}