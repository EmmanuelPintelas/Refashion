import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 100

function parsePositiveInt(value: unknown, fallback: number): number {
  if (typeof value !== "string") {
    return fallback
  }

  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed < 0) {
    return fallback
  }

  return parsed
}

function parseOptionalNonNegativeNumber(value: unknown): number | null {
  if (typeof value !== "string") {
    return null
  }

  const parsed = Number(value)

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null
  }

  return parsed
}

function normalizeSingleString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((v): v is string => typeof v === "string")
      .map((v) => v.trim())
      .filter(Boolean)
  }

  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed ? [trimmed] : []
  }

  return []
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    const materialInput = normalizeSingleString(req.query.material)
    const collectionTitleInput = normalizeSingleString(req.query.collection)
    const collectionIdsInput = normalizeStringArray(req.query.collection_id)
    const categoryNameInput = normalizeSingleString(req.query.category_name)

    const minPrice = parseOptionalNonNegativeNumber(req.query.min_price)
    const maxPrice = parseOptionalNonNegativeNumber(req.query.max_price)

    if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
      return res.status(400).json({
        code: "invalid_price_range",
        message: "min_price cannot be greater than max_price",
      })
    }

    const limit = Math.min(
      parsePositiveInt(req.query.limit, DEFAULT_LIMIT),
      MAX_LIMIT
    )

    const offset = parsePositiveInt(req.query.offset, 0)

    const filters: Record<string, any> = {}

    let resolvedCollectionIds: string[] = []

    if (collectionIdsInput.length > 0) {
      resolvedCollectionIds = collectionIdsInput
    } else if (collectionTitleInput) {
      const { data: collections } = await query.graph({
        entity: "product_collection",
        fields: ["id", "title"],
      })

      const normalizedCollectionTitle = collectionTitleInput.toLowerCase()

      resolvedCollectionIds = collections
        .filter((collection: any) => {
          const title =
            typeof collection.title === "string"
              ? collection.title.trim().toLowerCase()
              : ""

          return title === normalizedCollectionTitle
        })
        .map((collection: any) => collection.id)

      if (resolvedCollectionIds.length === 0) {
        return res.json({
          products: [],
          count: 0,
          limit,
          offset,
        })
      }
    }

    if (resolvedCollectionIds.length > 0) {
      filters.collection_id = resolvedCollectionIds
    }

    if (categoryNameInput) {
      const { data: categories } = await query.graph({
        entity: "product_category",
        fields: ["id", "name"],
      })

      const normalizedCategoryName = categoryNameInput.toLowerCase()

      const matchedCategoryIds = categories
        .filter((category: any) => {
          const name =
            typeof category.name === "string"
              ? category.name.trim().toLowerCase()
              : ""

          return name === normalizedCategoryName
        })
        .map((category: any) => category.id)

      if (matchedCategoryIds.length === 0) {
        return res.json({
          products: [],
          count: 0,
          limit,
          offset,
        })
      }

      filters.categories = {
        id: matchedCategoryIds,
      }
    }

    const { data: products } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "handle",
        "material",
        "thumbnail",
        "collection_id",
        "images.*",
        "categories.*",
        "variants.id",
        "variants.prices.*",
      ],
      filters,
    })

    const normalizedMaterial = materialInput?.toLowerCase()

    const filteredProducts = products.filter((product: any) => {
      if (normalizedMaterial) {
        const productMaterial =
          typeof product.material === "string"
            ? product.material.trim().toLowerCase()
            : ""

        if (productMaterial !== normalizedMaterial) {
          return false
        }
      }

      if (minPrice !== null || maxPrice !== null) {
        const variants = Array.isArray(product.variants) ? product.variants : []

        const matchesPrice = variants.some((variant: any) => {
          const prices = Array.isArray(variant.prices) ? variant.prices : []

          return prices.some((price: any) => {
            const amount =
              typeof price.amount === "number" ? price.amount : null

            if (amount === null) {
              return false
            }

            if (minPrice !== null && amount < minPrice) {
              return false
            }

            if (maxPrice !== null && amount > maxPrice) {
              return false
            }

            return true
          })
        })

        if (!matchesPrice) {
          return false
        }
      }

      return true
    })

    const paginatedProducts = filteredProducts.slice(offset, offset + limit)

    return res.json({
      products: paginatedProducts,
      count: filteredProducts.length,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error("FILTERS ROUTE ERROR:", error)

    return res.status(500).json({
      code: "filter_route_error",
      message: error?.message || "Unknown error",
    })
  }
}