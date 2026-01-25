import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function promoteToAdmin() {
  const adminEmail = "mohammedawidan@yahoo.com";
  
  console.log(`Promoting ${adminEmail} to admin role...`);
  
  try {
    // Check if user exists first
    const existingUser = await prisma.users.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      // User exists, just update role
      const user = await prisma.users.update({
        where: { email: adminEmail },
        data: { role: "admin" },
      });
      console.log(`✅ Successfully promoted existing user ${adminEmail} to admin role`);
      console.log(`User ID: ${user.id}`);
      console.log(`Role: ${user.role}`);
    } else {
      // User doesn't exist, create with hashed password
      const hashedPassword = await bcrypt.hash("11223344", 10);
      const user = await prisma.users.create({
        data: {
          email: adminEmail,
          name: "Mohammed Eweedan",
          password: hashedPassword,
          role: "admin",
        },
      });
      console.log(`✅ Successfully created new admin user ${adminEmail}`);
      console.log(`User ID: ${user.id}`);
      console.log(`Role: ${user.role}`);
      console.log(`⚠️  Default password set to: 11223344 - Please change it after first login!`);
    }
  } catch (error) {
    console.error("❌ Error promoting user to admin:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

promoteToAdmin();
