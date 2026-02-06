import bcrypt from "bcryptjs";
import {readFileSync} from "fs";
import {join} from "path";
import {prisma} from "../src/database";
import {CardModel} from "../src/generated/prisma/models/Card";
import {PokemonType} from "../src/generated/prisma/enums";

async function main() {
    console.log("🌱 Starting database seed...");

    await prisma.card.deleteMany();
    await prisma.user.deleteMany();
    await prisma.deck.deleteMany();
    await prisma.deckCard.deleteMany();

    const hashedPassword = await bcrypt.hash("password123", 10);

    await prisma.user.createMany({
        data: [
            {
                username: "red",
                email: "red@example.com",
                password: hashedPassword,
            },
            {
                username: "blue",
                email: "blue@example.com",
                password: hashedPassword,
            },
        ],
    });

    const redUser = await prisma.user.findUnique({where: {email: "red@example.com"}});
    const blueUser = await prisma.user.findUnique({where: {email: "blue@example.com"}});

    if (!redUser || !blueUser) {
        throw new Error("Failed to create users");
    }

    console.log("✅ Created users:", redUser.username, blueUser.username);

    const pokemonDataPath = join(__dirname, "data", "pokemon.json");
    const pokemonJson = readFileSync(pokemonDataPath, "utf-8");
    const pokemonData: CardModel[] = JSON.parse(pokemonJson);

    const createdCards = await Promise.all(
        pokemonData.map((pokemon) =>
            prisma.card.create({
                data: {
                    name: pokemon.name,
                    hp: pokemon.hp,
                    attack: pokemon.attack,
                    type: PokemonType[pokemon.type as keyof typeof PokemonType],
                    pokedexNumber: pokemon.pokedexNumber,
                    imgUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.pokedexNumber}.png`,
                },
            })
        )
    );

    console.log(`✅ Created ${pokemonData.length} Pokemon cards`);


        // Get all cards from database
        const allCards = await prisma.card.findMany();

        // Create Red's deck with 10 random cards
        const redDeck = await prisma.deck.create({
            data: {
                name: "Starter Deck",
                userId: redUser!.id,
            },
        });

        const shuffledForRed = [...allCards].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < 10; i++) {
            await prisma.deckCard.create({
                data: {
                    deckId: redDeck.id,
                    cardId: shuffledForRed[i].id,
                },
            });
        }

        console.log(`Red's deck created with 10 cards`);

        // Create Blue's deck with 10 random cards
        const blueDeck = await prisma.deck.create({
            data: {
                name: "Starter Deck",
                userId: blueUser!.id,
            },
        });

        const shuffledForBlue = [...allCards].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < 10; i++) {
            await prisma.deckCard.create({
                data: {
                    deckId: blueDeck.id,
                    cardId: shuffledForBlue[i].id,
                },
            });
        }

        console.log(`Blue's deck created with 10 cards`);


        console.log("\n🎉 Database seeding completed!");
}

main()
    .catch((e) => {
        console.error("❌ Error seeding database:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
