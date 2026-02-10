// define kieu User trong FE (khop voi BE tra ve)
export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string;
    // them truong khac neu can
}

// define response tu API login/register
export interface AuthResponse {
    user: User;
    token: string;
}
