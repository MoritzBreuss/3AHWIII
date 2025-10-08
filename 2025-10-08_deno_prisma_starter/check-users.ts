import { PrismaClient } from "./prisma/client/client.ts";

const prisma = new PrismaClient();

async function checkUsers() {
    try {
        const users = await prisma.user.findMany();
        console.log(`Anzahl User in der Datenbank: ${users.length}`);
        console.log("User:", users);
    } catch (error) {
        console.error("Fehler beim Abrufen der User:", error);
    } finally {
        await prisma.$disconnect();
    }
}

if (import.meta.main) {
    await checkUsers();
}