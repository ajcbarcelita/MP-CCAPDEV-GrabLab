import bcrypt from "bcrypt";

// Example values
const plainText = "12345678"; // Replace with the actual password you want to compare
const hashed = "$2b$12$N2Do3L.Xlcbo/zAuTmBTOe.P2hGfOo3UndoZQmd9FkhY3ukXmNK22"; // Replace with a real hash

async function compareAndPrint(plain, hash) {
    const match = await bcrypt.compare(plain, hash);
    console.log(`Do they match? ${match}`);
}

compareAndPrint(plainText, hashed);
