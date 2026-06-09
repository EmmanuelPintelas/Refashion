import { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

import customerReview from '../../../links/customer-review'
import productReview from '../../../links/product-review'
import sellerReview from '../../../links/seller-review'
import { createReviewWorkflow } from '../../../workflows/review/workflows'
import { StoreCreateReviewType, StoreGetReviewsParamsType } from './validators'

export const POST = async (
  req: AuthenticatedMedusaRequest<StoreCreateReviewType>,
  res: MedusaResponse
) => {
  const { result } = await createReviewWorkflow.run({
    container: req.scope,
    input: {
      ...req.validatedBody,
      customer_id: req.auth_context.actor_id,
    },
  })

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const {
    data: [review],
  } = await query.graph({
    entity: 'review',
    fields: req.queryConfig.fields,
    filters: {
      id: result.id,
    },
  })

  res.status(201).json({ review })
}

export const GET = async (
  req: AuthenticatedMedusaRequest<StoreGetReviewsParamsType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  let entity = customerReview.entryPoint

  let filters: Record<string, any> = {
    customer_id: req.auth_context.actor_id,
  }

  if (
    req.validatedQuery.reference === 'seller' &&
    req.validatedQuery.reference_id
  ) {
    entity = sellerReview.entryPoint

    filters = {
      seller_id: req.validatedQuery.reference_id,
    }
  }

  if (
    req.validatedQuery.reference === 'product' &&
    req.validatedQuery.reference_id
  ) {
    entity = productReview.entryPoint

    filters = {
      product_id: req.validatedQuery.reference_id,
    }
  }

  const reviewFields = req.queryConfig.fields.map(
    (field) => `review.${field}`
  )

  const relationFields =
    entity === productReview.entryPoint
      ? ['product.id', 'product.title']
      : entity === sellerReview.entryPoint
        ? ['seller.id', 'seller.name']
        : []

  const { data: reviews, metadata } = await query.graph({
    entity,
    fields: [...reviewFields, ...relationFields],
    filters,
    pagination: req.queryConfig.pagination,
  })

  const mappedReviews = reviews.map((relation: any) => {
    const review = relation.review

    if (entity === productReview.entryPoint) {
      return {
        ...review,
        reference_details: {
          id: relation.product?.id ?? review.reference_id ?? null,
          name: relation.product?.title ?? null,
        },
      }
    }

    if (entity === sellerReview.entryPoint) {
      return {
        ...review,
        reference_details: {
          id: relation.seller?.id ?? review.reference_id ?? null,
          name: relation.seller?.name ?? null,
        },
      }
    }

    return review
  })

  res.json({
    reviews: mappedReviews,
    count: metadata?.count,
    offset: metadata?.skip,
    limit: metadata?.take,
  })
}