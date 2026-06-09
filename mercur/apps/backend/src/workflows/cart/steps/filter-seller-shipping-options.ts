import { ShippingOptionDTO } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk'

import sellerProduct from '../../../links/seller-product'
import sellerShippingOption from '../../../links/seller-shipping-option'

export const filterSellerShippingOptionsStep = createStep(
  'filter-seller-shipping-options',
  async (
    input: { shipping_options?: ShippingOptionDTO[]; cart_id: string },
    { container }
  ) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const baseOptions = Array.isArray(input?.shipping_options)
      ? (input.shipping_options as ShippingOptionDTO[])
      : []

    if (!input.cart_id || !baseOptions.length) {
      return new StepResponse([])
    }

    // 1) Get current cart items
const { data: carts = [] } = await query.graph({
  entity: 'cart',
  fields: ['items.product_id', 'items.variant.product_id'],
  filters: { id: input.cart_id },
})

const cart = carts[0]

const items = Array.isArray(cart?.items) ? cart.items : []

const productIds = [
  ...new Set(
    items
      .map((item: any) => item?.product_id ?? item?.variant?.product_id)
      .filter(Boolean)
  ),
]

    if (!productIds.length) {
      return new StepResponse([])
    }
    //console.log('shipping filter debug', {
    //  cart_id: input.cart_id,
    //  base_options_count: baseOptions.length,
    //  items_count: items.length,
    //  productIds,
    //})

    // 2) Find sellers that own the current products in the cart
    const { data: sellersInCart = [] } = await query.graph({
      entity: sellerProduct.entryPoint,
      fields: ['seller_id'],
      filters: { product_id: productIds },
    })

    const sellerIdsInCart = [
      ...new Set(
        sellersInCart
          .map((sellerProductLink: any) => sellerProductLink?.seller_id)
          .filter(Boolean)
      ),
    ]

    if (!sellerIdsInCart.length) {
      return new StepResponse([])
    }

    // 3) Find shipping options linked only to the sellers of the current cart products
    const { data: sellerShippingOptions = [] } = await query.graph({
      entity: sellerShippingOption.entryPoint,
      fields: ['shipping_option_id', 'seller.name', 'seller.id'],
      filters: { seller_id: sellerIdsInCart },
    })

    if (!sellerShippingOptions.length) {
      return new StepResponse([])
    }

    const applicableOptionIds = new Set(
      sellerShippingOptions
        .map((relation: any) => relation?.shipping_option_id)
        .filter(Boolean)
    )
    //console.log('seller shipping filter ids', {
    //  baseOptionIds: baseOptions.map((option) => option.id),
    //  applicableOptionIds: Array.from(applicableOptionIds),
    //  sellerShippingOptions,
    //})
    // 4) Keep only Medusa-valid shipping options that belong to those sellers
    const optionsAvailable = baseOptions
  .filter((option) => applicableOptionIds.has(option.id))
  .map((option) => {
    const relation = sellerShippingOptions.find(
      (relation: any) => relation?.shipping_option_id === option.id
    )

    return {
      ...option,
      seller_name: relation?.seller?.name ?? null,
      seller_id: relation?.seller?.id ?? null,
    }
  })

//console.log('optionsAvailable', optionsAvailable)

return new StepResponse(optionsAvailable)
  }
)