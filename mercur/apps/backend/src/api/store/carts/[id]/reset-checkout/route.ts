import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

import {
  removeCartShippingMethodsWorkflow
} from '../../../../../workflows/cart/workflows'

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const cartId = req.params.id

  if (!cartId) {
    return res.status(400).json({
      message: 'Cart id is required'
    })
  }

  const {
    data: [cartBeforeReset]
  } = await query.graph({
    entity: 'cart',
    filters: {
      id: cartId
    },
    fields: [
      'id',
      'shipping_methods.id'
    ]
  })

  if (!cartBeforeReset) {
    return res.status(404).json({
      message: 'Cart not found'
    })
  }

  const shippingMethodIds =
    cartBeforeReset.shipping_methods?.map((method) => method.id) || []

  if (shippingMethodIds.length) {
    await removeCartShippingMethodsWorkflow.run({
      container: req.scope,
      input: {
        shipping_method_ids: shippingMethodIds
      }
    })
  }

  const {
    data: [cart]
  } = await query.graph({
    entity: 'cart',
    filters: {
      id: cartId
    },
    fields: [
      'id',
      'items.*',
      'shipping_methods.*',
      'shipping_address.*',
      'billing_address.*',
      'promotions.*',
      'payment_collection.*',
      'total',
      'subtotal',
      'shipping_total',
      'discount_total',
      'tax_total'
    ]
  })

  return res.json({
    cart,
    reset: true,
    cleared: {
      shipping_method_ids: shippingMethodIds
    },
    message: 'Checkout data cleared successfully'
  })
}