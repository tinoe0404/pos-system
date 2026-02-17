import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const newProducts = [
    { name: 'Gilberts', sku: 'BRANDY-GILBERTS', category: 'Brandy', price: 0.00 },
    { name: 'Magic Moment', sku: 'BRANDY-MAGIC-MOMENT', category: 'Brandy', price: 0.00 },
    { name: 'Ice Mint', sku: 'BARTOP-ICE-MINT', category: 'Bartops', price: 0.00 },
    { name: 'Exo Vodka', sku: 'BARTOP-EXO-VODKA', category: 'Bartops', price: 0.00 },
    { name: 'Mint Cigarettes', sku: 'CIG-MINT', category: 'Cigarettes', price: 0.00 },
    { name: 'Detroit', sku: 'BRANDY-DETROIT', category: 'Brandy', price: 0.00 },
    { name: 'CastleLite Dumpy', sku: 'BEER-CASTLELITE-DUMPY', category: 'Clear Beers Quarts', price: 0.00 },
    { name: 'Heineken Silver', sku: 'BEER-HEINEKEN-SILVER', category: 'Clear Beers Quarts', price: 0.00 },
    { name: 'Heineken Original', sku: 'BEER-HEINEKEN-ORIGINAL', category: 'Clear Beers Quarts', price: 0.00 },
    { name: 'Guarana', sku: 'SOFT-GUARANA', category: 'Soft Drinks', price: 0.00 },
    { name: 'Chateau 750ml', sku: 'BRANDY-CHATEAU-750', category: 'Brandy', price: 0.00 },
    { name: 'Chateau 200ml', sku: 'BRANDY-CHATEAU-200', category: 'Brandy', price: 0.00 },
    { name: 'Nyati Baobab', sku: 'BARTOP-NYATI-BAOBAB', category: 'Bartops', price: 0.00 },
    { name: 'Scud 1 Litre', sku: 'BEER-SCUD-1L', category: 'Clear Beers Quarts', price: 0.00 },
    { name: 'Coke Pet', sku: 'SOFT-COKE-PET', category: 'Soft Drinks', price: 0.00 },
    { name: 'Cape Style', sku: 'BARTOP-CAPE-STYLE', category: 'Bartops', price: 0.00 },
    { name: 'Windhoek', sku: 'BEER-WINDHOEK', category: 'Clear Beers Quarts', price: 0.00 },
]

async function main() {
    console.log('🚀 Seeding 17 new products...\n')

    for (const product of newProducts) {
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
        console.log(`  ✅ ${created.name} (${created.category}) — SKU: ${created.sku}, Stock: ${created.stock}`)
    }

    console.log('\n🎉 All 17 products seeded successfully!')
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
