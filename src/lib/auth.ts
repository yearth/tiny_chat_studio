import { prisma } from '@/server/db/client';

// Function to validate user credentials
export async function validateUser(email: string, password: string) {
  // In a real application, you would hash the password and compare with the stored hash
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.password !== password) {
    return null;
  }

  return user;
}

// Function to create a new user
export async function createUser(email: string, password: string, name?: string) {
  // In a real application, you would hash the password before storing
  try {
    const user = await prisma.user.create({
      data: {
        email,
        password,
        name,
      },
    });
    
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Function to get user by ID
export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    
    return user;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
}
