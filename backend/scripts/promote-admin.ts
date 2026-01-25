import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function promoteToAdmin() {
  const adminEmail = "mohammedawidan@yahoo.com";
  
  console.log(`Promoting ${adminEmail} to admin role...`);
  
  try {
    const user = await prisma.users.upsert({
      where: { email: adminEmail },
      update: { role: "admin" },
      create: {
        email: adminEmail,
        name: "Mohammed Eweedan",
        password: "11223344",
        role: "admin",
      },
    });
    
    console.log(`✅ Successfully promoted ${adminEmail} to admin role`);
    console.log(`User ID: ${user.id}`);
    console.log(`Role: ${user.role}`);
  } catch (error) {
    console.error("❌ Error promoting user to admin:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

promoteToAdmin();
