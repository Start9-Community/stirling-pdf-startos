import { mkdir } from 'node:fs/promises'
import { sdk } from '../sdk'

export const createDirectories = sdk.setupOnInit(async () => {
  await Promise.all(
    ['configs', 'tessdata', 'pipeline', 'logs', 'customFiles', 'startos'].map(
      (subpath) =>
        mkdir(sdk.volumes.main.subpath(subpath), { recursive: true }),
    ),
  )
})
