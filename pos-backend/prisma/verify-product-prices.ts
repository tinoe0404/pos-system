import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const products = await prisma.product.findMany({
        where: {
            sku: {
                in: [
                    'BEER-Q-CASTLE',
                    'BRANDY-GILBERTS',
                    'CIG-MINT',
                    'EATS-SPUDS-25G',
                ],
            },
        },
        select: { name: true, sku: true, price: true, description: true, stock: true },
    })

    console.log('\n🔍 Verification Check:\n')
    for (const p of products) {
        console.log(`  ${p.name.padEnd(20)} | Price: ${p.price} | Stock: ${p.stock} | ${p.description}`)
    }
    await prisma.$disconnect()
}

main()
