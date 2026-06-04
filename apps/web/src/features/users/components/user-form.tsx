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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateUserWithAuth, useUpdateUser } from '@/lib/supabase/queries';
import { supabase } from '@/lib/supabase/client';
import { generateTempPassword } from '@/lib/supabase/auth';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@pharma-ims/shared';
import type { UserRole } from '@pharma-ims/shared';

const ROLES: UserRole[] = [
  'Sales Representative',
  'Store Manager',
  'Finance Officer',
  'Delivery Driver',
  'Technical Manager/Owner',
];

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: Tables<'users'> | null;
  onSave?: (action: 'USER_CREATE' | 'USER_EDIT', userId: string, userName: string) => void;
}

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  isActive: string;
}

function userToForm(u: Tables<'users'>): FormState {
  return {
    fullName: u.full_name,
    email: u.email,
    phone: u.phone ?? '',
    role: u.role,
    isActive: u.is_active !== false ? 'true' : 'false',
  };
}

export function UserForm({ open, onOpenChange, user, onSave }: UserFormProps) {
  const createUser = useCreateUserWithAuth();
  const updateUser = useUpdateUser();
  const { toast } = useToast();
  const isEditing = !!user;
  const [form, setForm] = useState<FormState>({
    fullName: '', email: '', phone: '', role: '', isActive: 'true',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [resetSent, setResetSent] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [submitError, setSubmitError] = useState('');
  const initializing = useRef(true);

  useEffect(() => {
    if (open) {
      setForm(user ? userToForm(user) : { fullName: '', email: '', phone: '', role: '', isActive: 'true' });
      setErrors({});
      setSubmitError('');
      setGeneratedPassword('');
      initializing.current = false;
    }
  }, [open, user]);

  useEffect(() => {
    if (!open) {
      setGeneratedPassword('');
      setSubmitError('');
    }
  }, [open]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!form.fullName.trim()) errs.fullName = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    if (!form.role) errs.role = 'Role is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    if (isEditing && user) {
      try {
        await updateUser.mutateAsync({
          id: user.id,
          full_name: form.fullName,
          email: form.email,
          phone: form.phone || null,
          role: form.role,
          is_active: form.isActive === 'true',
        });
        onSave?.('USER_EDIT', user.id, form.fullName);
        toast({ title: 'User updated', description: `${form.fullName} has been updated.` });
        onOpenChange(false);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to update user';
        setSubmitError(msg);
        toast({ title: 'Error', description: msg, variant: 'destructive' });
      }
    } else {
      const tempPassword = generateTempPassword();
      try {
        await createUser.mutateAsync({
          email: form.email,
          password: tempPassword,
          fullName: form.fullName,
          phone: form.phone || null,
          role: form.role,
          isActive: form.isActive === 'true',
        });
        setGeneratedPassword(tempPassword);
        onSave?.('USER_CREATE', '', form.fullName);
        toast({ title: 'User created', description: `${form.fullName} has been created with a temporary password.` });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to create user';
        setSubmitError(msg);
        toast({ title: 'Error', description: msg, variant: 'destructive' });
      }
    }
  }

  async function handleSendPasswordReset() {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth/login`,
    });
    if (!error) {
      setResetSent(true);
      setTimeout(() => setResetSent(false), 3000);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit User' : 'Add User'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update user profile, role, or status.' : 'Create a new system user.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Full Name *" error={errors.fullName}>
            <Input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} />
          </Field>
          <Field label="Email *" error={errors.email}>
            <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </Field>
          <Field label="Phone" error={errors.phone}>
            <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </Field>
          <Field label="Role *" error={errors.role}>
            <Select value={form.role} onValueChange={(v) => set('role', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role..." />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={form.isActive} onValueChange={(v) => set('isActive', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {isEditing && (
            <div className="pt-2 space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSendPasswordReset}
                disabled={resetSent}
              >
                {resetSent ? 'Reset link sent!' : 'Send Password Reset'}
              </Button>
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters with uppercase, lowercase, number, and special character.
              </p>
            </div>
          )}

          {generatedPassword && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-2">
              <p className="text-sm font-semibold text-green-800">User Created Successfully</p>
              <p className="text-sm text-green-700">
                Temporary password for <strong>{form.email}</strong>:
              </p>
              <div className="flex items-center gap-2">
                <code className="rounded bg-green-100 px-3 py-1.5 text-sm font-mono font-bold text-green-900 select-all">
                  {generatedPassword}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPassword);
                    toast({ title: 'Copied', description: 'Password copied to clipboard.' });
                  }}
                >
                  Copy
                </Button>
              </div>
              <p className="text-xs text-green-600">
                Share this password with the user. They will be asked to change it on first login.
              </p>
            </div>
          )}

          {submitError && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{submitError}</p>
          )}

          {!generatedPassword && (
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={createUser.isPending || updateUser.isPending}>
                {createUser.isPending ? 'Creating...' : isEditing ? 'Save' : 'Add User'}
              </Button>
            </div>
          )}

          {generatedPassword && (
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => { setGeneratedPassword(''); onOpenChange(false); }}>
                Close
              </Button>
            </div>
          )}
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
