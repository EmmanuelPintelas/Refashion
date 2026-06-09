import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const customerId = req.params.id

  const limit = Math.min(
    Math.max(Number(req.query.limit) || 10, 1),
    50
  )

  if (!customerId) {
    return res.status(400).json({
      message: "Customer id is required",
    })
  }

  try {
    const { rows } = await pool.query(
      `
      SELECT 
        id,
        email,
        total_rewards,
        co2_saved_kg,
        water_saved_liters,
        landfill_reduced_kg
      FROM customer
      WHERE id = $1
      LIMIT 1
      `,
      [customerId]
    )

    const customer = rows[0]

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      })
    }

    const { rows: rewardTransactions } = await pool.query(
      `
      SELECT
        delta,
        reason,
        created_at
      FROM rewards_ledger
      WHERE subject_type = 'customer'
      AND subject_id = $1
      ORDER BY created_at DESC
      LIMIT $2
      `,
      [customerId, limit]
    )

    const { rows: orderRows } = await pool.query(
      `
      SELECT COUNT(*)::int AS total_orders
      FROM "order"
      WHERE customer_id = $1
      `,
      [customerId]
    )

    const { rows: soldItemsRows } = await pool.query(
      `
      SELECT COALESCE(SUM(oi.quantity), 0)::int AS total_sold_items
      FROM seller s
      JOIN seller_seller_order_order soo
        ON soo.seller_id = s.id
      JOIN "order" o
        ON o.id = soo.order_id
      JOIN order_item oi
        ON oi.order_id = o.id
      WHERE s.email = CONCAT($1::text, '.refashion')
      `,
      [customer.email]
    )

    const { rows: wishlistRows } = await pool.query(
  `
  SELECT COUNT(*)::int AS wishlist_items
  FROM customer_customer_wishlist_wishlist ccww
  JOIN wishlist_wishlist_product_product wwpp
    ON wwpp.wishlist_id = ccww.wishlist_id
  WHERE ccww.customer_id = $1
  `,
  [customerId]
)

const wishlistItems = Number(
  wishlistRows[0]?.wishlist_items ?? 0
)

    

    const totalOrders = Number(orderRows[0]?.total_orders ?? 0)
    const totalSoldItems = Number(soldItemsRows[0]?.total_sold_items ?? 0)

    return res.status(200).json({
      id: customer.id,

      total_rewards: Number(customer.total_rewards ?? 0),
      co2_saved_kg: Number(customer.co2_saved_kg ?? 0),
      water_saved_liters: Number(customer.water_saved_liters ?? 0),
      landfill_reduced_kg: Number(customer.landfill_reduced_kg ?? 0),

      total_orders: totalOrders,
      total_sold_items: totalSoldItems,
      wishlist_items: wishlistItems,

      reward_transactions: rewardTransactions.map((tx) => ({
        delta: Number(tx.delta ?? 0),
        reason: tx.reason,
        created_at: tx.created_at,
      })),
    })
  } catch (e: any) {
    console.error("Rewards route error:", e)

    return res.status(500).json({
      message: e.message || "Failed to fetch customer data",
    })
  }
}