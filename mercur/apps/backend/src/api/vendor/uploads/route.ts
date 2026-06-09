import { uploadFilesWorkflow } from '@medusajs/core-flows'
import {
  AuthenticatedMedusaRequest,
  MedusaResponse
} from '@medusajs/framework/http'
import { HttpTypes } from '@medusajs/framework/types'
import { MedusaError } from '@medusajs/framework/utils'

export const POST = async (
  req: AuthenticatedMedusaRequest<HttpTypes.AdminUploadFile>,
  res: MedusaResponse
) => {
  const input = (req as any).files

  if (!input?.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      'No files were uploaded'
    )
  }

  const { result } = await uploadFilesWorkflow(req.scope).run({
    input: {
      files: input.map((f) => ({
        filename: f.originalname,
        mimeType: f.mimetype,
        content: f.buffer.toString('binary'),
        access: 'public'
      }))
    }
  })

  const publicBackendUrl =
    process.env.PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:9000'

  const files = result.map((file: any) => {
    const parsedUrl = new URL(file.url)

    return {
      ...file,
      url: `${publicBackendUrl}${parsedUrl.pathname}`
    }
  })

  res.json({ files })
}