const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function resetScores() {
  try {
    const deleted = await prisma.gameScore.deleteMany({})
    console.log(`Successfully deleted ${deleted.count} game scores.`)
  } catch (err) {
    console.error('Error resetting scores:', err)
  } finally {
    await prisma.$disconnect()
  }
}

resetScores()
