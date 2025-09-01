export interface User {
    id: string;
    email: string;
    username: string;
    password: string;
  }
  
  export interface AuthResult {
    access_token: string;
    refresh_token: string;
    user: {
      id: string;
      email: string;
      username: string;
    };
  }