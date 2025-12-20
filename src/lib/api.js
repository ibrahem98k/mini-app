const API_BASE_URL = 'http://server.mouamle.space:19990/api';

export async function authenticateWithMiniApps(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth-with-superQi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { ok: true, data };
  } catch (error) {
    console.error('MiniApps authentication error:', error);
    return { ok: false, error: error.message };
  }
}
