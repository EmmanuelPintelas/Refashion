import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  res.json({
    shipping_returns: {
      shipping:
        "Standard shipping is available for all orders. Expedited shipping options may be available depending on the selected shipping method and destination. Orders are typically processed and shipped within 3-5 business days.",
      returns:
        "We offer a 30-day return policy. If you are not completely satisfied with your purchase, you may return eligible items for a refund or exchange, provided they are unused, in their original condition, and include all original tags and packaging."
    }
  })
}
