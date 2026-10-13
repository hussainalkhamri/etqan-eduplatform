-- Add pdf_url column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS pdf_url text;

-- Create storage bucket for product PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-pdfs', 'product-pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product PDFs
CREATE POLICY "Anyone can view product PDFs"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-pdfs');

CREATE POLICY "Admins can upload product PDFs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-pdfs' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update product PDFs"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-pdfs' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete product PDFs"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-pdfs' AND has_role(auth.uid(), 'admin'::app_role));