import * as fs from "fs/promises"
import * as path from "path"

const NON_INITIALIZER_REGEX = /^index\.(ts|js)$/

async function importAndExecuteInitializers() {
  const files = await fs.readdir(__dirname)

  return files.reduce(async (previousInitializerAction, file) => {
    await previousInitializerAction

    if (NON_INITIALIZER_REGEX.test(file)) return

    const modulePath = path.join(__dirname, file)
    console.log(`Running initializer: ${modulePath}`)

    const { default: initializerAction } = await import(modulePath)

    return initializerAction().catch((error: any) => {
      console.error(`Initialization error in ${modulePath}:`, error)
      return Promise.reject(error)
    })
  }, Promise.resolve())
}

importAndExecuteInitializers()
  .then(() => process.exit(0))
  .catch(() => {
    console.log("Failed to complete initialization!")
    return process.exit(0)
  })
