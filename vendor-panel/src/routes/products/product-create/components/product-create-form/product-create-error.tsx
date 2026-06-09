import { Button, Heading, Text } from "@medusajs/ui"

type ProductCreateErrorProps = {
  primaryLabel: string
  onPrimaryClick: () => void
}

export const ProductCreateError = ({
  primaryLabel,
  onPrimaryClick,
}: ProductCreateErrorProps) => {
  return (
    <div className="flex size-full items-center justify-center">
      <div className="flex max-w-[420px] flex-col items-center gap-y-4 text-center">
        <Heading level="h2">Store address required</Heading>
        <Text className="text-ui-fg-subtle">
          Before creating a product, you need to complete your store address.
        </Text>
        <Button size="small" variant="primary" onClick={onPrimaryClick}>
          {primaryLabel}
        </Button>
      </div>
    </div>
  )
}
