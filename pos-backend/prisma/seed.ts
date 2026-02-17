import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// ── All Products (with prices, descriptions, categories) ──
const allProducts = [
  // === CLEAR BEERS QUARTS (750ml) ===
  { name: 'Castle', sku: 'BEER-Q-CASTLE', category: 'Clear Beers Quarts', price: 2.00, description: 'Castle Lager 750ml Quart' },
  { name: 'Black Label', sku: 'BEER-Q-BLACK-LABEL', category: 'Clear Beers Quarts', price: 2.00, description: 'Carling Black Label 750ml Quart' },
  { name: 'Zambezi', sku: 'BEER-Q-ZAMBEZI', category: 'Clear Beers Quarts', price: 2.00, description: 'Zambezi Lager 750ml Quart' },
  { name: 'Castle Lite', sku: 'BEER-Q-CASTLE-LITE', category: 'Clear Beers Quarts', price: 2.50, description: 'Castle Lite Premium Lager 750ml Quart' },
  { name: 'Eagle', sku: 'BEER-Q-EAGLE', category: 'Clear Beers Quarts', price: 1.50, description: 'Eagle Lager 750ml Quart' },
  { name: 'CastleLite Dumpy', sku: 'BEER-CASTLELITE-DUMPY', category: 'Clear Beers Quarts', price: 1.50, description: 'Castle Lite 330ml Dumpy' },
  { name: 'Heineken Silver', sku: 'BEER-HEINEKEN-SILVER', category: 'Clear Beers Quarts', price: 2.50, description: 'Heineken Silver Premium Beer' },
  { name: 'Heineken Original', sku: 'BEER-HEINEKEN-ORIGINAL', category: 'Clear Beers Quarts', price: 2.50, description: 'Heineken Original Premium Beer' },
  { name: 'Scud 1 Litre', sku: 'BEER-SCUD-1L', category: 'Clear Beers Quarts', price: 1.00, description: 'Chibuku Scud 1 Litre Sorghum Beer' },
  { name: 'Windhoek', sku: 'BEER-WINDHOEK', category: 'Clear Beers Quarts', price: 2.50, description: 'Windhoek Lager' },

  // === CLEAR BEERS PINTS (375ml) ===
  { name: 'Castle Pint', sku: 'BEER-P-CASTLE', category: 'Clear Beers Pints', price: 1.25, description: 'Castle Lager 375ml Pint' },
  { name: 'Black Label Pint', sku: 'BEER-P-BLACK-LABEL', category: 'Clear Beers Pints', price: 1.25, description: 'Carling Black Label 375ml Pint' },
  { name: 'Zambezi Pint', sku: 'BEER-P-ZAMBEZI', category: 'Clear Beers Pints', price: 1.25, description: 'Zambezi Lager 375ml Pint' },
  { name: 'Castle Lite Pint', sku: 'BEER-P-CASTLE-LITE', category: 'Clear Beers Pints', price: 1.50, description: 'Castle Lite 375ml Pint' },

  // === BRANDY & SPIRITS ===
  { name: 'Gilberts', sku: 'BRANDY-GILBERTS', category: 'Brandy', price: 6.00, description: 'Gilberts Gin 750ml' },
  { name: 'Magic Moment', sku: 'BRANDY-MAGIC-MOMENT', category: 'Brandy', price: 5.00, description: 'Magic Moment Vodka 750ml' },
  { name: 'Detroit', sku: 'BRANDY-DETROIT', category: 'Brandy', price: 5.00, description: 'Detroit Spirit 750ml' },
  { name: 'Gold Blend 750', sku: 'BRANDY-GOLD-BLEND-750', category: 'Brandy', price: 8.00, description: 'Gold Blend Whisky 750ml' },
  { name: 'Gold Blend No 9 750ml', sku: 'BRANDY-GOLD-BLEND-NO9-750', category: 'Brandy', price: 9.00, description: 'Gold Blend No. 9 Whisky 750ml' },
  { name: '4th Street 750ml', sku: 'BRANDY-4TH-STREET-750', category: 'Brandy', price: 5.00, description: '4th Street Sweet Wine 750ml' },
  { name: 'Two Keys 750ml', sku: 'BRANDY-TWO-KEYS-750', category: 'Brandy', price: 8.00, description: 'Two Keys Whisky 750ml' },
  { name: 'Two Keys 200ml', sku: 'BRANDY-TWO-KEYS-200', category: 'Brandy', price: 3.00, description: 'Two Keys Whisky 200ml Flask' },
  { name: 'Chateau 750ml', sku: 'BRANDY-CHATEAU-750', category: 'Brandy', price: 6.00, description: 'Chateau Brandy 750ml' },
  { name: 'Chateau 200ml', sku: 'BRANDY-CHATEAU-200', category: 'Brandy', price: 2.50, description: 'Chateau Brandy 200ml Flask' },
  { name: 'Nikolai 750ml', sku: 'BRANDY-NIKOLAI-750', category: 'Brandy', price: 6.00, description: 'Nikolai Vodka 750ml' },
  { name: 'Pushkin 750ml', sku: 'BRANDY-PUSHKIN-750', category: 'Brandy', price: 6.00, description: 'Pushkin Vodka 750ml' },
  { name: 'Vice Roy 750ml', sku: 'BRANDY-VICE-ROY-750', category: 'Brandy', price: 9.00, description: 'Viceroy Brandy 750ml' },
  { name: 'Brutal Fruit', sku: 'BRANDY-BRUTAL-FRUIT', category: 'Brandy', price: 1.50, description: 'Brutal Fruit Spritzer 330ml' },
  { name: 'Bootleg', sku: 'BRANDY-BOOTLEG', category: 'Brandy', price: 2.00, description: 'Bootleg Pre-mixed Drink' },

  // === BARTOPS / CIDERS / RTDs ===
  { name: 'Ice Mint', sku: 'BARTOP-ICE-MINT', category: 'Bartops', price: 1.50, description: 'Ice Mint Spirit Cooler' },
  { name: 'Exo Vodka', sku: 'BARTOP-EXO-VODKA', category: 'Bartops', price: 1.50, description: 'Exo Vodka Spirit Cooler' },
  { name: 'Nyati Baobab', sku: 'BARTOP-NYATI-BAOBAB', category: 'Bartops', price: 1.50, description: 'Nyati Baobab Spirit' },
  { name: 'Cape Style', sku: 'BARTOP-CAPE-STYLE', category: 'Bartops', price: 1.50, description: 'Cape Style Wine Cooler' },
  { name: 'Savanna Dry', sku: 'BARTOP-SAVANNA-DRY', category: 'Bartops', price: 1.75, description: 'Savanna Dry Premium Cider 330ml' },
  { name: 'Hunter Pints', sku: 'BARTOP-HUNTER-PINTS', category: 'Bartops', price: 1.25, description: 'Hunters Gold/Dry Pint' },
  { name: 'Hunter 750ml', sku: 'BARTOP-HUNTER-750', category: 'Bartops', price: 2.25, description: 'Hunters Gold/Dry 750ml' },

  // === SOFT DRINKS ===
  { name: 'Guarana', sku: 'SOFT-GUARANA', category: 'Soft Drinks', price: 1.00, description: 'Guarana Energy Drink' },
  { name: 'Coke Pet', sku: 'SOFT-COKE-PET', category: 'Soft Drinks', price: 1.00, description: 'Coca-Cola PET Bottle 500ml' },
  { name: 'King Size Cokes', sku: 'SOFT-KING-SIZE-COKES', category: 'Soft Drinks', price: 1.00, description: 'Coca-Cola King Size Bottle' },
  { name: 'Dragon', sku: 'SOFT-DRAGON', category: 'Soft Drinks', price: 1.00, description: 'Dragon Energy Drink' },
  { name: 'Wild Cat', sku: 'SOFT-WILD-CAT', category: 'Soft Drinks', price: 1.00, description: 'Wild Cat Energy Drink' },

  // === MA EATS (SNACKS) ===
  { name: 'Spuds 25 grams', sku: 'EATS-SPUDS-25G', category: 'Ma Eats', price: 0.50, description: 'Spuds Potato Chips 25g' },
  { name: 'Mega Snacks', sku: 'EATS-MEGA-SNACKS', category: 'Ma Eats', price: 1.00, description: 'Mega Chips Large Pack' },

  // === CIGARETTES ===
  { name: 'Mint Cigarettes', sku: 'CIG-MINT', category: 'Cigarettes', price: 1.50, description: 'Menthol Cigarettes Pack of 20' },
  { name: 'Madison', sku: 'CIG-MADISON', category: 'Cigarettes', price: 1.50, description: 'Madison Toasted Cigarettes Pack of 20' },
  { name: 'Everest', sku: 'CIG-EVEREST', category: 'Cigarettes', price: 1.50, description: 'Everest Menthol Cigarettes Pack of 20' },
  { name: 'Pacific Storm', sku: 'CIG-PACIFIC-STORM', category: 'Cigarettes', price: 1.00, description: 'Pacific Storm Cigarettes Pack of 20' },
  { name: 'Pacific Breeze', sku: 'CIG-PACIFIC-BREEZE', category: 'Cigarettes', price: 1.00, description: 'Pacific Breeze Cigarettes Pack of 20' },
  { name: 'Scuds', sku: 'CIG-SCUDS', category: 'Cigarettes', price: 0.20, description: 'Loose Cigarettes (Scuds)' },
  { name: 'Super', sku: 'CIG-SUPER', category: 'Cigarettes', price: 1.00, description: 'Super Cigarettes Pack of 20' },
  { name: 'Nyati', sku: 'CIG-NYATI', category: 'Cigarettes', price: 0.50, description: 'Nyati Cigarettes Pack of 20' },
]

async function main() {
  console.log('🚀 Starting full seed...\n')

  // ── 1. Seed Users ──
  const adminPassword = await bcrypt.hash('admin123', 10)
  const cashierPassword = await bcrypt.hash('cashier123', 10)

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password_hash: adminPassword,
      role: 'admin',
    },
  })

  const cashier = await prisma.user.upsert({
    where: { username: 'cashier' },
    update: {},
    create: {
      username: 'cashier',
      password_hash: cashierPassword,
      role: 'cashier',
    },
  })

  console.log('✅ Users seeded:', { admin: admin.username, cashier: cashier.username })

  // ── 2. Seed Products (upsert by SKU, auto-generated cuid IDs) ──
  console.log(`\n📦 Seeding ${allProducts.length} products...\n`)

  for (const product of allProducts) {
    const created = await prisma.product.upsert({
      where: { sku: product.sku },
      update: {
        price: product.price,
        description: product.description,
        category: product.category,
        is_active: true,
      },
      create: {
        // id is auto-generated by Prisma (@default(cuid()))
        name: product.name,
        sku: product.sku,
        category: product.category,
        price: product.price,
        description: product.description,
        stock: 20,
        min_stock: 10,
        is_active: true,
      },
    })
    console.log(`  ✅ ${created.name.padEnd(25)} | $${created.price.toString().padEnd(6)} | ${created.sku}`)
  }

  console.log(`\n🎉 Seed complete! ${allProducts.length} products and 2 users ready.`)
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