-- Add whatsapp_number to orders table
ALTER TABLE public.orders ADD COLUMN whatsapp_number text;

-- Add comment
COMMENT ON COLUMN public.orders.whatsapp_number IS 'رقم الواتساب للتواصل مع العميل';