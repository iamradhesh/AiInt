export interface User {
  _id: string; // Unique identifier for the user
  name: string; // User's name
  email: string; // User's email
  credits: number; // User's credits
  createdAt: string; // ISO string for the creation date
  updatedAt: string; // ISO string for the last update date
  __v: number; // Version key (used in MongoDB)
}

export interface RootState {
  user: {
    userData: User | null
  }
}