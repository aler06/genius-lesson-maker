export interface UserModel {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}