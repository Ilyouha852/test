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
    const profile = mockUserProfiles.find(profile => profile.id === id);
    return profile ?? null;
}

export async function retrieveUserProfileFromDatabaseByEmail(
    email: string,
): Promise<UserProfile | null> {
    const profile = mockUserProfiles.find(profile => profile.email === email);
    return profile ?? null;
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

    const existing = mockUserProfiles[index]!; // Safe because we checked index !== -1
    const updated: UserProfile = {
        id: existing.id,
        email: data.email ?? existing.email,
        name: data.name ?? existing.name,
        hashedPassword: data.hashedPassword ?? existing.hashedPassword,
        createdAt: existing.createdAt,
        updatedAt: new Date(),
    };

    mockUserProfiles[index] = updated;
    return updated;
}

/* DELETE */
export async function deleteUserProfileFromDatabaseById(
    id: string,
): Promise<UserProfile | null> {
    const index = mockUserProfiles.findIndex(profile => profile.id === id);
    if (index === -1) return null;

    const profile = mockUserProfiles.splice(index, 1)[0];
    return profile ?? null;
}
