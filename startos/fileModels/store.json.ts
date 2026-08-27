import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const shape = z.looseObject({
  adminUsername: z.string().optional().catch(undefined),
  adminPassword: z.string().optional().catch(undefined),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: 'startos/store.json' },
  shape,
)
