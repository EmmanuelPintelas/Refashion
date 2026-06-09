import {
  ContainerRegistrationKeys,
  MedusaError,
  promiseAll,
} from '@medusajs/framework/utils'
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk'

import sellerProductLink from '../../../links/seller-product'
import sellerShippingOptionLink from '../../../links/seller-shipping-option'

type ValidateCartShippingOptionsInput = {
  cart_id: string
  option_ids: string[]
}

// μικρό logger για debug
const dbg = (...args: any[]) => {
  if (
    process.env.DEBUG_CART_SHIPPING === 'true' ||
    process.env.DEBUG_CART_SELLERS === 'true'
  ) {
    // eslint-disable-next-line no-console
    console.log('[validate-cart-shipping-options]', ...args)
  }
}

export const validateCartShippingOptionsStep = createStep(
  'validate-cart-shipping-options',
  async (input: ValidateCartShippingOptionsInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const optionIds = [
      ...new Set((input.option_ids ?? []).filter(Boolean)),
    ]

    if (!input.cart_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'Cart id is required'
      )
    }

    if (!optionIds.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'At least one shipping option is required'
      )
    }

    // 1) cart → product ids
    const {
      data: [cart],
    } = await query.graph({
      entity: 'cart',
      fields: ['id', 'items.product_id', 'items.variant.product_id'],
      filters: { id: input.cart_id },
    })

    const productIds = [
      ...new Set(
        (cart?.items ?? [])
          .map((i: any) => i?.product_id ?? i?.variant?.product_id)
          .filter(Boolean)
      ),
    ]

    dbg('cart products =', productIds)

    if (!productIds.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'Cart has no products to validate shipping options against'
      )
    }

    // 2) links που χρειαζόμαστε
    const [{ data: sellerProductsRaw = [] }, { data: sellerShipLinksRaw = [] }] =
      await promiseAll([
        query.graph({
          entity: sellerProductLink.entryPoint,
          fields: ['product_id', 'seller.id', 'seller_id'],
          filters: { product_id: productIds },
        }),
        query.graph({
          entity: sellerShippingOptionLink.entryPoint,
          fields: [
            'shipping_option_id',
            'shipping_option.id',
            'seller.id',
            'seller_id',
          ],
          filters: { shipping_option_id: optionIds },
        }),
      ])

    dbg('sellerProductsRaw sample =', sellerProductsRaw?.[0])
    dbg('sellerShipLinksRaw sample =', sellerShipLinksRaw?.[0])

    // 3) seller_ids που υπάρχουν στο cart
    const cartSellerIds = new Set<string>(
      (sellerProductsRaw as any[])
        .map((sp) => sp?.seller?.id ?? sp?.seller_id)
        .filter(Boolean)
    )

    dbg('cartSellerIds =', Array.from(cartSellerIds))

    if (!cartSellerIds.size) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'No sellers found for the cart products'
      )
    }

    // 4) ομαδοποίηση shipping links ανά option_id
    const byOption = new Map<
      string,
      { option_id: string; seller_id: string }[]
    >()

    ;(sellerShipLinksRaw as any[]).forEach((lnk) => {
      const optionId: string =
        lnk?.shipping_option_id ?? lnk?.shipping_option?.id
      const sellerId: string = lnk?.seller?.id ?? lnk?.seller_id

      if (!optionId || !sellerId) {
        return
      }

      const arr = byOption.get(optionId) ?? []
      arr.push({ option_id: optionId, seller_id: sellerId })
      byOption.set(optionId, arr)
    })

    // 5) για ΚΑΘΕ unique option, βρες ΕΝΑ link που ταιριάζει με cart sellers
    const matchedLinks: { shipping_option_id: string; seller_id: string }[] = []

    for (const optionId of optionIds) {
      const links = byOption.get(optionId) ?? []
      const match = links.find((l) => cartSellerIds.has(l.seller_id))

      dbg(`option ${optionId} → links=`, links, 'match=', match)

      if (!match) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Shipping option with id: ${optionId} is not available for any of the cart items`
        )
      }

      matchedLinks.push({
        shipping_option_id: match.option_id,
        seller_id: match.seller_id,
      })
    }

    dbg('matchedLinks (filtered 1:1) =', matchedLinks)

    return new StepResponse({
      sellerProducts: sellerProductsRaw,
      sellerShippingOptions: matchedLinks,
    })
  }
)