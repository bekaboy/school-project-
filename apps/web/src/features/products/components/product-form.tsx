import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { mapToDb } from '@/lib/utils/mapping';
import { useCreateProduct, useUpdateProduct } from '@/lib/supabase/queries';
import { uploadProductImage } from '@/lib/supabase/storage';
import { ImagePlus, X } from 'lucide-react';
import type { Tables } from '@pharma-ims/shared';

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Tables<'products'> | null;
}

interface FormState {
  genericName: string;
  brandName: string;
  strength: string;
  dosageForm: string;
  packSize: string;
  manufacturer: string;
  countryOfOrigin: string;
  unitOfMeasure: string;
  category: string;
  costPrice: string;
  sellingPrice: string;
  taxRate: string;
  reorderQuantity: string;
  storageRequirements: string;
  description: string;
  imageUrl: string;
}

const initialForm: FormState = {
  genericName: '', brandName: '', strength: '', dosageForm: '', packSize: '',
  manufacturer: '', countryOfOrigin: '', unitOfMeasure: '', category: '',
  costPrice: '', sellingPrice: '', taxRate: '0', reorderQuantity: '10',
  storageRequirements: '', description: '', imageUrl: '',
};

function productToForm(product: Tables<'products'>): FormState {
  return {
    genericName: product.generic_name,
    brandName: product.brand_name,
    strength: product.strength,
    dosageForm: product.dosage_form,
    packSize: product.pack_size,
    manufacturer: product.manufacturer,
    countryOfOrigin: product.country_of_origin,
    unitOfMeasure: product.unit_of_measure,
    category: product.category,
    costPrice: String(product.cost_price),
    sellingPrice: String(product.selling_price),
    taxRate: String(product.tax_rate ?? 0),
    reorderQuantity: String(product.reorder_quantity),
    storageRequirements: product.storage_requirements ?? '',
    description: product.description ?? '',
    imageUrl: product.image_url ?? '',
  };
}

export function ProductForm({ open, onOpenChange, product }: ProductFormProps) {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const isEditing = !!product;
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setForm(product ? productToForm(product) : initialForm);
      setErrors({});
      setImageFile(null);
      setImagePreview(null);
    }
  }, [open, product]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!form.genericName.trim()) errs.genericName = 'Generic name is required';
    if (!form.brandName.trim()) errs.brandName = 'Brand name is required';
    if (!form.strength.trim()) errs.strength = 'Strength is required';
    if (!form.dosageForm.trim()) errs.dosageForm = 'Dosage form is required';
    if (!form.packSize.trim()) errs.packSize = 'Pack size is required';
    if (!form.manufacturer.trim()) errs.manufacturer = 'Manufacturer is required';
    if (!form.countryOfOrigin.trim()) errs.countryOfOrigin = 'Country of origin is required';
    if (!form.unitOfMeasure.trim()) errs.unitOfMeasure = 'Unit of measure is required';
    if (!form.category.trim()) errs.category = 'Category is required';
    if (!form.costPrice || Number(form.costPrice) <= 0) errs.costPrice = 'Cost price must be positive';
    if (!form.sellingPrice || Number(form.sellingPrice) <= 0) errs.sellingPrice = 'Selling price must be positive';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setUploading(true);

    let imageUrl = form.imageUrl;
    if (imageFile) {
      const tempId = `temp_${Date.now()}`;
      imageUrl = await uploadProductImage(imageFile, isEditing && product ? product.id : tempId);
    }

    const values = {
      ...form,
      imageUrl,
      costPrice: Number(form.costPrice),
      sellingPrice: Number(form.sellingPrice),
      taxRate: Number(form.taxRate),
      reorderQuantity: Number(form.reorderQuantity),
    };

    const dbData = mapToDb(values) as Record<string, unknown>;

    if (isEditing && product) {
      await updateProduct.mutateAsync({ id: product.id, ...dbData });
    } else {
      const year = new Date().getFullYear();
      const seq = String(Math.floor(Math.random() * 90000) + 10000);
      const productId = `PROD-${year}-${seq}`;
      await createProduct.mutateAsync({ ...dbData, product_id: productId } as never);
    }

    setUploading(false);
    onOpenChange(false);
  }

  const pending = createProduct.isPending || updateProduct.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Product' : 'Add Product'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the product information below.' : 'Fill in the details to add a new pharmaceutical product.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Generic Name *" error={errors.genericName}>
              <Input placeholder="e.g. Amoxicillin" value={form.genericName} onChange={(e) => set('genericName', e.target.value)} />
            </Field>
            <Field label="Brand Name *" error={errors.brandName}>
              <Input placeholder="e.g. Amoxil" value={form.brandName} onChange={(e) => set('brandName', e.target.value)} />
            </Field>
            <Field label="Strength *" error={errors.strength}>
              <Input placeholder="e.g. 500mg" value={form.strength} onChange={(e) => set('strength', e.target.value)} />
            </Field>
            <Field label="Dosage Form *" error={errors.dosageForm}>
              <Input placeholder="e.g. Tablet" value={form.dosageForm} onChange={(e) => set('dosageForm', e.target.value)} />
            </Field>
            <Field label="Pack Size *" error={errors.packSize}>
              <Input placeholder="e.g. 100 tablets" value={form.packSize} onChange={(e) => set('packSize', e.target.value)} />
            </Field>
            <Field label="Category *" error={errors.category}>
              <Input placeholder="e.g. Antibiotic" value={form.category} onChange={(e) => set('category', e.target.value)} />
            </Field>
            <Field label="Manufacturer *" error={errors.manufacturer}>
              <Input placeholder="Manufacturer name" value={form.manufacturer} onChange={(e) => set('manufacturer', e.target.value)} />
            </Field>
            <Field label="Country of Origin *" error={errors.countryOfOrigin}>
              <Input placeholder="e.g. Ethiopia" value={form.countryOfOrigin} onChange={(e) => set('countryOfOrigin', e.target.value)} />
            </Field>
            <Field label="Unit of Measure *" error={errors.unitOfMeasure}>
              <Input placeholder="e.g. Bottle, Box" value={form.unitOfMeasure} onChange={(e) => set('unitOfMeasure', e.target.value)} />
            </Field>
            <Field label="Reorder Qty *" error={errors.reorderQuantity}>
              <Input type="number" min="1" value={form.reorderQuantity} onChange={(e) => set('reorderQuantity', e.target.value)} />
            </Field>
            <Field label="Cost Price (ETB) *" error={errors.costPrice}>
              <Input type="number" step="0.01" min="0" placeholder="0.00" value={form.costPrice} onChange={(e) => set('costPrice', e.target.value)} />
            </Field>
            <Field label="Selling Price (ETB) *" error={errors.sellingPrice}>
              <Input type="number" step="0.01" min="0" placeholder="0.00" value={form.sellingPrice} onChange={(e) => set('sellingPrice', e.target.value)} />
            </Field>
            <Field label="Tax Rate (%)">
              <Input type="number" min="0" max="100" value={form.taxRate} onChange={(e) => set('taxRate', e.target.value)} />
            </Field>
          </div>

          <Field label="Storage Requirements">
            <Textarea placeholder="e.g. Store below 25°C" value={form.storageRequirements} onChange={(e) => set('storageRequirements', e.target.value)} />
          </Field>

          <Field label="Description">
            <Textarea placeholder="Optional description..." value={form.description} onChange={(e) => set('description', e.target.value)} />
          </Field>

          <Field label="Product Image">
            <div className="flex items-start gap-4">
              <div
                className="flex h-32 w-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed bg-muted/30 hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview || form.imageUrl ? (
                  <img
                    src={imagePreview ?? form.imageUrl}
                    alt="Preview"
                    className="h-full w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
                    <ImagePlus className="h-6 w-6" />
                    <span>Upload</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  {imagePreview || form.imageUrl ? 'Change' : 'Browse'}
                </Button>
                {(imagePreview || form.imageUrl) && (
                  <Button type="button" variant="ghost" size="sm" onClick={clearImage}>
                    <X className="mr-1 h-3 w-3" /> Remove
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
              </div>
            </div>
          </Field>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending || uploading}>{uploading ? 'Uploading...' : isEditing ? 'Update Product' : 'Add Product'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
