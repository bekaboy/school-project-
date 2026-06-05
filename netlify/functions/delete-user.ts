export const handler = async (event: any, _context: any): Promise<any> => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }), headers };
  }

  try {
    const { email } = JSON.parse(event.body ?? '{}');
    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email is required' }), headers };
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error' }), headers };
    }

    const listRes = await fetch(
      `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      },
    );
    const users = await listRes.json();
    const found = Array.isArray(users) ? users.find((u: any) => u.email === email) : null;

    if (!found?.id) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Auth user not found' }), headers };
    }

    const delRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${found.id}`, {
      method: 'DELETE',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    });

    if (!delRes.ok) {
      const err = await delRes.json();
      return { statusCode: 400, body: JSON.stringify({ error: err.msg || err.error || 'Failed to delete auth user' }), headers };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
      headers,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return { statusCode: 500, body: JSON.stringify({ error: message }), headers };
  }
};
