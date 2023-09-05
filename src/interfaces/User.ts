export default interface User {
  username: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
  createdBy: string
  updatedBy: string
}

export interface UserWithId extends User
{
  _id: string
} 
