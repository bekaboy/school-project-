import { supabase } from './client';

const PAYMENT_PROOFS_BUCKET = 'payment-proofs';
const PRODUCT_IMAGES_BUCKET = 'product-images';

export async function uploadPaymentProof(file: File, orderId: string): Promise<string> {
  const filePath = `${orderId}/${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage
    .from(PAYMENT_PROOFS_BUCKET)
    .upload(filePath, file);

  if (error) throw error;

  const { data: urlData } = supabase.storage.from(PAYMENT_PROOFS_BUCKET).getPublicUrl(data.path);
  return urlData.publicUrl;
}

export async function uploadProductImage(file: File, productId: string): Promise<string> {
  const filePath = `${productId}/${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(filePath, file);

  if (error) throw error;

  const { data: urlData } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(data.path);
  return urlData.publicUrl;
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}
