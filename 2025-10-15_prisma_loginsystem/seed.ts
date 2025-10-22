import { PrismaClient } from "./prisma/client/client.ts";
const prisma = new PrismaClient();
const seed_users = [ 
    { name: "Ben", email: "ben@example.com", password: "password123" },
    { name: "Georgi", email: "georgi@example.com", password: "password123" },
    { name: "Marcel", email: "marcel@example.com", password: "password123" },
    { name: "Dejan", email: "dejan@example.com", password: "password123" },
    { name: "Moritz", email: "moritz@example.com", password: "password123" },
]


const post_user = [{
    title: "Hello World",
    content: "This is my first post",
    username: "Ben"
},
{
    title: "Hello Mars",
    content: "This is my second post",
    username: "Ben"
},
{    title: "Hello Venus",
    content: "This is my third post",
    username: "Marcel"
}, {
    title: "Hello Jupiter",
    content: "This is my fourth post",
    username: "Dejan"
}, {
    title: "Hello Saturn",
    content: "This is my fifth post",
    username: "Dejan"
}, {    titel: "Hello Neptune",
    title: "Hello Neptune",
    content: "This is my sixth post",
    username: "Dejan"
}
]

export async function seed() {
    for (const user of seed_users) {
        await prisma.user.create({
            data: user
        });
    }
    for (const post of post_user) {
        await prisma.post.create({
            data: {
                title: post.title,
                content: post.content,
                user: { 
                    connect: { 
                        name: post.username 
                    }, 
                },
            },

        });
    }
}

if (import.meta.main) {
    await seed();
    console.log("Seeding finished.");
}