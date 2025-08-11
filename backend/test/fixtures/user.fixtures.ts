import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export interface UserFixture {
  email: string;
  password: string;
  name: string;
  hashedPassword?: string;
}

export const userFixtures: UserFixture[] = [
  {
    email: 'john.doe@example.com',
    password: 'password123',
    name: 'John Doe',
  },
  {
    email: 'jane.smith@example.com',
    password: 'securepassword',
    name: 'Jane Smith',
  },
  {
    email: 'test.user@example.com',
    password: 'testpassword',
    name: 'Test User',
  },
];

export async function createUserFixture(userData?: Partial<UserFixture>): Promise<UserFixture> {
  const defaultUser = userFixtures[0];
  const user = { ...defaultUser, ...userData };
  
  user.hashedPassword = await bcrypt.hash(user.password, 10);
  
  return user;
}

export async function createMultipleUserFixtures(count: number = 3): Promise<UserFixture[]> {
  const users: UserFixture[] = [];
  
  for (let i = 0; i < count; i++) {
    const baseUser = userFixtures[i] || userFixtures[0];
    const user = await createUserFixture({
      ...baseUser,
      email: `user${i}@example.com`,
      name: `Test User ${i}`,
    });
    users.push(user);
  }
  
  return users;
}