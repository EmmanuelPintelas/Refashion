import { NextFunction } from 'express'
import { verify } from 'jsonwebtoken'

import {
  AuthType,
  ConfigModule,
  MedusaRequest,
  MedusaResponse,
  getAuthContextFromJwtToken
} from '@medusajs/framework'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

export function checkSellerApproved(authTypes: AuthType[]) {
  return async (
    req: MedusaRequest,
    res: MedusaResponse,
    next: NextFunction
  ) => {
    const {
      projectConfig: { http }
    } = req.scope.resolve<ConfigModule>(ContainerRegistrationKeys.CONFIG_MODULE)

    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Unauthorized'
      })
    }

    const token = authHeader.replace('Bearer ', '')

    try {
      verify(token, http.jwtSecret!)
    } catch (e) {
      return res.status(401).json({
        message: 'Unauthorized'
      })
    }

    const ctx = getAuthContextFromJwtToken(
      authHeader,
      http.jwtSecret!,
      authTypes,
      ['seller']
    )
    //console.log("CTX:", ctx)

    if (!ctx) {
      return res.status(401).json({
        message: 'Unauthorized'
      })
    }

    if (!ctx.actor_id) {
      return res.status(403).json({
        message: 'Seller is not active'
      })
    }

    return next()
  }
}