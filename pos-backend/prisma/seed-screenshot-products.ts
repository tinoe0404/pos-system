import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const screenshotProducts = [
    // === Clear Beers Quarts ===
    { name: 'Castle', sku: 'BEER-Q-CASTLE', category: 'Clear Beers Quarts', price: 2.00 },
    { name: 'Black Label', sku: 'BEER-Q-BLACK-LABEL', category: 'Clear Beers Quarts', price: 2.00 },
    { name: 'Zambezi', sku: 'BEER-Q-ZAMBEZI', category: 'Clear Beers Quarts', price: 2.00 },
    { name: 'Castle Lite', sku: 'BEER-Q-CASTLE-LITE', category: 'Clear Beers Quarts', price: 2.50 },
    { name: 'Eagle', sku: 'BEER-Q-EAGLE', category: 'Clear Beers Quarts', price: 1.50 },

    // === Clear Beers Pints ===
    { name: 'Castle Pint', sku: 'BEER-P-CASTLE', category: 'Clear Beers Pints', price: 1.25 },
    { name: 'Black Label Pint', sku: 'BEER-P-BLACK-LABEL', category: 'Clear Beers Pints', price: 1.25 },
    { name: 'Zambezi Pint', sku: 'BEER-P-ZAMBEZI', category: 'Clear Beers Pints', price: 1.25 },
    { name: 'Castle Lite Pint', sku: 'BEER-P-CASTLE-LITE', category: 'Clear Beers Pints', price: 1.50 },

    // === Brandy ===
    { name: 'Gold Blend 750', sku: 'BRANDY-GOLD-BLEND-750', category: 'Brandy', price: 8.00 },
    { name: 'Gold Blend No 9 750ml', sku: 'BRANDY-GOLD-BLEND-NO9-750', category: 'Brandy', price: 9.00 },
    { name: '4th Street 750ml', sku: 'BRANDY-4TH-STREET-750', category: 'Brandy', price: 5.00 },
    { name: 'Two Keys 750ml', sku: 'BRANDY-TWO-KEYS-750', category: 'Brandy', price: 8.00 },
    { name: 'Two Keys 200ml', sku: 'BRANDY-TWO-KEYS-200', category: 'Brandy', price: 3.00 },
    { name: 'Nikolai 750ml', sku: 'BRANDY-NIKOLAI-750', category: 'Brandy', price: 6.00 },
    { name: 'Pushkin 750ml', sku: 'BRANDY-PUSHKIN-750', category: 'Brandy', price: 6.00 },
    { name: 'Vice Roy 750ml', sku: 'BRANDY-VICE-ROY-750', category: 'Brandy', price: 9.00 },
    { name: 'Brutal Fruit', sku: 'BRANDY-BRUTAL-FRUIT', category: 'Brandy', price: 1.50 },
    { name: 'Bootleg', sku: 'BRANDY-BOOTLEG', category: 'Brandy', price: 2.00 },

    // === Bartops ===
    { name: 'Savanna Dry', sku: 'BARTOP-SAVANNA-DRY', category: 'Bartops', price: 1.75 },
    { name: 'Hunter Pints', sku: 'BARTOP-HUNTER-PINTS', category: 'Bartops', price: 1.25 },
    { name: 'Hunter 750ml', sku: 'BARTOP-HUNTER-750', category: 'Bartops', price: 2.25 },

    // === Soft Drinks ===
    { name: 'King Size Cokes', sku: 'SOFT-KING-SIZE-COKES', category: 'Soft Drinks', price: 1.00 },
    { name: 'Dragon', sku: 'SOFT-DRAGON', category: 'Soft Drinks', price: 1.00 },
    { name: 'Wild Cat', sku: 'SOFT-WILD-CAT', category: 'Soft Drinks', price: 1.00 },

    // === Ma Eats ===
    { name: 'Spuds 25 grams', sku: 'EATS-SPUDS-25G', category: 'Ma Eats', price: 0.50 },
    { name: 'Mega Snacks', sku: 'EATS-MEGA-SNACKS', category: 'Ma Eats', price: 1.00 },

    // === Cigarettes ===
    { name: 'Madison', sku: 'CIG-MADISON', category: 'Cigarettes', price: 1.50 },
    { name: 'Everest', sku: 'CIG-EVEREST', category: 'Cigarettes', price: 1.50 },
    { name: 'Pacific Storm', sku: 'CIG-PACIFIC-STORM', category: 'Cigarettes', price: 1.00 },
    { name: 'Pacific Breeze', sku: 'CIG-PACIFIC-BREEZE', category: 'Cigarettes', price: 1.00 },
    { name: 'Scuds', sku: 'CIG-SCUDS', category: 'Cigarettes', price: 0.20 },
    { name: 'Super', sku: 'CIG-SUPER', category: 'Cigarettes', price: 1.00 },
    { name: 'Nyati', sku: 'CIG-NYATI', category: 'Cigarettes', price: 0.50 },
]

async function main() {
    console.log(`🚀 Seeding ${screenshotProducts.length} products from screenshot...\n`)

    for (const product of screenshotProducts) {
        const created = await prisma.product.upsert({
            where: { sku: product.sku },
            update: {
                stock: 20,
            },
            create: {
                name: product.name,
                sku: product.sku,
                category: product.category,
                price: product.price,
                stock: 20,
                min_stock: 10,
                is_active: true,
            },
        })
        console.log(`  ✅ ${created.name.padEnd(25)} | ${(created.category ?? '').padEnd(20)} | Stock: ${created.stock}`)
    }

    console.log(`\n🎉 All ${screenshotProducts.length} products seeded successfully!`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error('❌ Seed failed:', e)
        await prisma.$disconnect()
        process.exit(1)
    })
