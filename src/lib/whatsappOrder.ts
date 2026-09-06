const GTBS_WHATSAPP_NUMBER = "917490028867";

export interface WhatsAppOrderItem {
  title: string;
  quantity: number;
  unitPrice: number;
  productUrl: string;
  variantSummary?: string;
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

export function createWhatsAppOrderUrl(
  items: WhatsAppOrderItem[],
  total?: number,
) {
  const productLines = items.flatMap((item, index) => [
    `${index + 1}. ${item.title}`,
    `Quantity: ${item.quantity}`,
    ...(item.variantSummary ? [`Details: ${item.variantSummary}`] : []),
    `Price: ${formatPrice(item.unitPrice * item.quantity)}`,
    `Product link: ${item.productUrl}`,
    "",
  ]);
  const message = [
    "Hello GTBS Book Store!",
    "I would like to buy the following product(s):",
    "",
    ...productLines,
    ...(typeof total === "number" ? [`Total: ${formatPrice(total)}`, ""] : []),
    "Please confirm availability, delivery, and payment details.",
  ].join("\n");

  return `https://wa.me/${GTBS_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
