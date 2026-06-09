import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const customerId = req.auth_context?.actor_id

  if (!customerId) {
    return res.status(401).json({
      message: "Customer authentication required",
    })
  }

  const { rows } = await pool.query(
    `
    SELECT 
      rec_product_id1,
      rec_product_id2,
      rec_product_id3
    FROM customer
    WHERE id = $1
    `,
    [customerId]
  )

  if (!rows.length) {
    return res.status(404).json({
      message: "Customer not found",
    })
  }

  const row = rows[0]

  const suggested_product_ids = [
    row.rec_product_id1,
    row.rec_product_id2,
    row.rec_product_id3,
  ].filter(Boolean)

  return res.json({
    suggested_product_ids,
  })
}
