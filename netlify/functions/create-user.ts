import type { HandlerEvent, HandlerContext, HandlerResponse } from '@netlify/functions';

interface CreateUserBody {
  email: string;
  password: string;
  role: string;
  fullName: string;
  phone: string | null;
  isActive: boolean;
}

export const handler = async (
  event: HandlerEvent,
  _context: HandlerContext,
): Promise<HandlerResponse> => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }), headers };
  }

  try {
    const body: CreateUserBody = JSON.parse(event.body ?? '{}');
    const { email, password, role, fullName, phone, isActive } = body;

    if (!email || !password || !role || !fullName) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }), headers };
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error' }), headers };
    }

    const res = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { role, full_name: fullName },
      }),
    });

    const authUser = await res.json();
    if (!res.ok) {
      return { statusCode: 400, body: JSON.stringify({ error: authUser.msg || authUser.error || 'Failed to create auth user' }), headers };
    }

    const authId = (authUser as { id: string }).id;
    if (!authId) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Auth user creation returned no ID' }), headers };
    }

    const dbRes = await fetch(`${supabaseUrl}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        id: authId,
        email,
        full_name: fullName,
        phone: phone || null,
        role,
        is_active: isActive,
      }),
    });

    if (!dbRes.ok) {
      const dbError = await dbRes.json();
      const deleteRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${authId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      });
      if (!deleteRes.ok) {
        const delErr = await deleteRes.json();
        console.error('Orphaned auth user:', authId, delErr);
      }
      return { statusCode: 400, body: JSON.stringify({ error: dbError.message || 'Failed to create user record' }), headers };
    }

    const [userRecord] = await dbRes.json();

    return {
      statusCode: 200,
      body: JSON.stringify(userRecord),
      headers,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return { statusCode: 500, body: JSON.stringify({ error: message }), headers };
  }
};
