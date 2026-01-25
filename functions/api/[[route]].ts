
import { Client } from '@neondatabase/serverless';

// --- SQL SCHEMA DEFINITION (Code-First approach) ---
const SCHEMA_SQL = `
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        owner_id TEXT NOT NULL,
        title TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
`;

// --- SECURITY UTILS (PBKDF2) ---
async function generateSalt() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password: string, salt: string) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw", 
        enc.encode(password), 
        { name: "PBKDF2" }, 
        false, 
        ["deriveBits"]
    );
    
    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: enc.encode(salt),
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        256
    );
    
    return Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
    }
    return btoa(binary);
};

const fetchImageAsDataUrl = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to fetch image url: ${res.status}`);
    }
    const contentType = res.headers.get('content-type') || 'image/png';
    const buffer = await res.arrayBuffer();
    const base64 = arrayBufferToBase64(buffer);
    return `data:${contentType};base64,${base64}`;
};

const extractImageFromJson = (data: any) => {
    if (!data) return undefined;
    if (data.imageUrl) return data.imageUrl;
    if (data.url) return data.url;
    if (data.image) return data.image;
    if (data.b64_json) return `data:image/png;base64,${data.b64_json}`;
    if (data.data?.[0]?.b64_json) return `data:image/png;base64,${data.data[0].b64_json}`;
    if (data.data?.[0]?.url) return data.data[0].url;
    if (data.images?.[0]?.url) return data.images[0].url;
    if (data.generated_images?.[0]?.url) return data.generated_images[0].url;
    if (data.generations_by_pk?.generated_images?.[0]?.url) return data.generations_by_pk.generated_images[0].url;
    if (data.result?.image) return data.result.image;
    if (data.result?.images?.[0]) return data.result.images[0];
    if (data.output?.[0]) return data.output[0];
    return undefined;
};

const handleImageGenerate = async (context: any) => {
    const body: any = await context.request.json();
    const provider = body.provider as string;
    const prompt = body.prompt as string;
    const width = body.width ? Number(body.width) : undefined;
    const height = body.height ? Number(body.height) : undefined;
    const referenceImage = body.referenceImage as string | undefined;
    const apiKeyOverride = body.apiKey as string | undefined;

    if (!provider || !prompt) {
        return new Response(JSON.stringify({ error: "Missing provider or prompt." }), { status: 400 });
    }

    if (provider === 'OPENAI') {
        const apiKey = apiKeyOverride || context.env.OPENAI_API_KEY;
        if (!apiKey) return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY." }), { status: 400 });
        const model = context.env.OPENAI_IMAGE_MODEL || 'gpt-image-1.5';
        const size = width && height
            ? (width >= height ? '1536x1024' : '1024x1536')
            : '1024x1024';
        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                prompt,
                n: 1,
                size,
                response_format: 'b64_json'
            })
        });
        if (!response.ok) {
            const errText = await response.text();
            return new Response(JSON.stringify({ error: errText || 'OpenAI image generation failed.' }), { status: response.status });
        }
        const data = await response.json();
        let image = extractImageFromJson(data);
        if (image?.startsWith('http')) image = await fetchImageAsDataUrl(image);
        return new Response(JSON.stringify({ imageUrl: image }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (provider === 'STABILITY') {
        const apiKey = apiKeyOverride || context.env.STABILITY_API_KEY;
        if (!apiKey) return new Response(JSON.stringify({ error: "Missing STABILITY_API_KEY." }), { status: 400 });
        const endpoint = context.env.STABILITY_IMAGE_URL || 'https://api.stability.ai/v2beta/stable-image/generate/core';
        const form = new FormData();
        form.append('prompt', prompt);
        form.append('output_format', 'png');
        if (width && height) {
            form.append('width', String(width));
            form.append('height', String(height));
        }
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'image/*'
            },
            body: form
        });
        if (!response.ok) {
            const errText = await response.text();
            return new Response(JSON.stringify({ error: errText || 'Stability image generation failed.' }), { status: response.status });
        }
        const contentType = response.headers.get('content-type') || '';
        if (contentType.startsWith('image/')) {
            const buffer = await response.arrayBuffer();
            const base64 = arrayBufferToBase64(buffer);
            return new Response(JSON.stringify({ imageUrl: `data:${contentType};base64,${base64}` }), { headers: { 'Content-Type': 'application/json' } });
        }
        const data = await response.json();
        let image = extractImageFromJson(data);
        if (image?.startsWith('http')) image = await fetchImageAsDataUrl(image);
        return new Response(JSON.stringify({ imageUrl: image }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (provider === 'FLUX') {
        const apiKey = apiKeyOverride || context.env.BFL_API_KEY;
        if (!apiKey) return new Response(JSON.stringify({ error: "Missing BFL_API_KEY." }), { status: 400 });
        const baseUrl = context.env.BFL_BASE_URL || 'https://api.bfl.ai';
        const modelPath = context.env.BFL_MODEL_PATH || '/v1/flux-2-max';
        const payload: any = {
            prompt,
            width: width || 1024,
            height: height || 1024,
            output_format: 'png'
        };
        if (referenceImage) {
            payload.input_image = referenceImage.replace(/^data:image\/(png|jpg|jpeg|webp);base64,/, "");
        }
        const response = await fetch(`${baseUrl}${modelPath}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-key': apiKey
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errText = await response.text();
            return new Response(JSON.stringify({ error: errText || 'Flux image generation failed.' }), { status: response.status });
        }
        const data = await response.json();
        const pollingUrl = data.polling_url || data.pollingUrl;
        if (!pollingUrl) return new Response(JSON.stringify({ error: "Flux did not return polling_url." }), { status: 502 });
        let image: string | undefined;
        for (let i = 0; i < 30; i++) {
            const poll = await fetch(pollingUrl, { headers: { 'x-key': apiKey } });
            const pollData = await poll.json();
            image = extractImageFromJson(pollData);
            if (image) break;
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
        if (image?.startsWith('http')) image = await fetchImageAsDataUrl(image);
        if (!image) return new Response(JSON.stringify({ error: "Flux generation timed out." }), { status: 504 });
        return new Response(JSON.stringify({ imageUrl: image }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (provider === 'LEONARDO') {
        const apiKey = apiKeyOverride || context.env.LEONARDO_API_KEY;
        if (!apiKey) return new Response(JSON.stringify({ error: "Missing LEONARDO_API_KEY." }), { status: 400 });
        const modelId = context.env.LEONARDO_MODEL_ID || '6bef9f1b-29cb-40c7-b9df-32b51c1f67d3';
        const response = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                prompt,
                width: width || 1024,
                height: height || 1024,
                modelId
            })
        });
        if (!response.ok) {
            const errText = await response.text();
            return new Response(JSON.stringify({ error: errText || 'Leonardo image generation failed.' }), { status: response.status });
        }
        const data = await response.json();
        const generationId = data.generationId || data.sdGenerationJob?.generationId || data.sdGenerationJob?.id;
        if (!generationId) return new Response(JSON.stringify({ error: "Leonardo did not return generation id." }), { status: 502 });
        let image: string | undefined;
        for (let i = 0; i < 30; i++) {
            const poll = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
                headers: { 'authorization': `Bearer ${apiKey}`, 'accept': 'application/json' }
            });
            const pollData = await poll.json();
            image = extractImageFromJson(pollData);
            if (image) break;
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
        if (image?.startsWith('http')) image = await fetchImageAsDataUrl(image);
        if (!image) return new Response(JSON.stringify({ error: "Leonardo generation timed out." }), { status: 504 });
        return new Response(JSON.stringify({ imageUrl: image }), { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: `Unsupported provider: ${provider}` }), { status: 400 });
};

export const onRequest = async (context: any) => {
  const url = new URL(context.request.url);
  const method = context.request.method;
  const path = url.pathname.replace('/api/', ''); 

  if (path === 'image/generate' && method === 'POST') {
      return handleImageGenerate(context);
  }

  // Safely get DB URL
  const dbUrl = context.env.DATABASE_URL;
  
  // If no DB configured, return 503 immediately
  if (!dbUrl || dbUrl.trim() === '') {
      return new Response(JSON.stringify({ error: "Database not configured" }), { status: 503 });
  }

  // Cast to any to avoid TypeScript errors
  const client: any = new Client(dbUrl);
  
  try {
      await client.connect();
  } catch (dbErr: any) {
      console.error("DB Connection Failed:", dbErr);
      // Return 503 so frontend falls back to local storage
      return new Response(JSON.stringify({ error: "Database Connection Failed", details: dbErr.message }), { status: 503 });
  }

  // Helper to ensure DB is ready (Lazy Initialization)
  const ensureSchema = async () => {
      try {
          await client.query(SCHEMA_SQL);
      } catch (e) {
          console.error("Schema Init Failed", e);
      }
  };

  try {
    // --- SYSTEM ROUTES ---
    if (path === 'system/init' && method === 'GET') {
        await ensureSchema();
        return new Response(JSON.stringify({ status: "Database initialized successfully" }), { headers: { 'Content-Type': 'application/json' } });
    }

    // --- AUTH ROUTES ---
    if (path === 'auth/login' && method === 'POST') {
      const body: any = await context.request.json();
      const { email, password } = body;
      
      try {
          const { rows } = await client.query('SELECT * FROM users WHERE email = $1', [email]);
          
          if (rows.length === 0) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
          
          const user = rows[0];
          
          // Secure Hash Verification
          const inputHash = await hashPassword(password, user.salt);
          
          if (inputHash !== user.password_hash) {
              return new Response(JSON.stringify({ error: "Invalid password" }), { status: 401 });
          }
          
          return new Response(JSON.stringify(user.data), { headers: { 'Content-Type': 'application/json' } });
      } catch (e: any) {
          if (e.code === '42P01') { // Undefined table
              await ensureSchema();
              return new Response(JSON.stringify({ error: "System initialized. Please try again." }), { status: 503 });
          }
          throw e;
      }
    }

    if (path === 'auth/register' && method === 'POST') {
      const body: any = await context.request.json();
      const { id, email, password, data } = body;

      try {
        // Generate Salt & Hash
        const salt = await generateSalt();
        const hash = await hashPassword(password, salt);

        await client.query(
            'INSERT INTO users (id, email, password_hash, salt, data) VALUES ($1, $2, $3, $4, $5)',
            [id, email, hash, salt, JSON.stringify(data)]
        );
        return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
      } catch (e: any) {
        if (e.code === '42P01') {
            await ensureSchema();
            // Retry once after schema creation
            const salt = await generateSalt();
            const hash = await hashPassword(password, salt);
            await client.query(
                'INSERT INTO users (id, email, password_hash, salt, data) VALUES ($1, $2, $3, $4, $5)',
                [id, email, hash, salt, JSON.stringify(data)]
            );
            return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
        }
        if (e.code === '23505') {
             return new Response(JSON.stringify({ error: "Email already exists" }), { status: 400 });
        }
        throw e;
      }
    }

    // --- ADMIN ROUTES ---
    
    if (path === 'admin/users' && method === 'GET') {
        try {
            const { rows } = await client.query('SELECT data FROM users ORDER BY created_at DESC LIMIT 100');
            const users = rows.map(r => r.data);
            return new Response(JSON.stringify(users), { headers: { 'Content-Type': 'application/json' } });
        } catch (e: any) {
            if (e.code === '42P01') return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
            throw e;
        }
    }

    if (path === 'admin/user/update' && method === 'POST') {
        const body = await context.request.json();
        const { id, updates } = body;
        
        // Fetch current data first to merge
        const { rows } = await client.query('SELECT data FROM users WHERE id = $1', [id]);
        if (rows.length === 0) return new Response("User not found", { status: 404 });
        
        const currentData = rows[0].data;
        const newData = { ...currentData, ...updates };
        
        await client.query('UPDATE users SET data = $1 WHERE id = $2', [JSON.stringify(newData), id]);
        
        return new Response(JSON.stringify({ success: true, user: newData }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (path === 'admin/projects' && method === 'GET') {
        try {
            // Admin sees ALL projects, active or not
            const { rows } = await client.query('SELECT data FROM projects ORDER BY updated_at DESC LIMIT 50');
            const projects = rows.map(r => r.data);
            return new Response(JSON.stringify(projects), { headers: { 'Content-Type': 'application/json' } });
        } catch (e: any) {
            return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
        }
    }

    if (path === 'admin/stats' && method === 'GET') {
        try {
            const userCountRes = await client.query('SELECT COUNT(*) FROM users');
            const projectCountRes = await client.query('SELECT COUNT(*) FROM projects WHERE is_active = TRUE');
            
            const stats = {
                totalUsers: parseInt(userCountRes.rows[0].count),
                activeProjects: parseInt(projectCountRes.rows[0].count),
                revenue: parseInt(userCountRes.rows[0].count) * 10, // Mock revenue metric based on users
                flaggedContent: 0 
            };
            return new Response(JSON.stringify(stats), { headers: { 'Content-Type': 'application/json' } });
        } catch (e: any) {
            return new Response(JSON.stringify({ totalUsers: 0, activeProjects: 0, revenue: 0, flaggedContent: 0 }), { headers: { 'Content-Type': 'application/json' } });
        }
    }

    // --- PROJECT ROUTES ---
    
    if (path.startsWith('projects') && method === 'GET') {
        const userId = url.searchParams.get('userId');
        const type = url.searchParams.get('type');
        
        let query = 'SELECT data FROM projects WHERE 1=1';
        const params: any[] = [];
        
        if (userId) {
            params.push(userId);
            query += ` AND owner_id = $${params.length}`;
        }
        
        if (type === 'active') {
            query += ` AND is_active = TRUE`;
        }

        try {
            const { rows } = await client.query(query, params);
            const projects = rows.map(r => r.data);
            return new Response(JSON.stringify(projects), { headers: { 'Content-Type': 'application/json' } });
        } catch (e: any) {
            if (e.code === '42P01') { 
                await ensureSchema(); 
                return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
            }
            throw e;
        }
    }

    if (path === 'projects/save' && method === 'POST') {
        const body: any = await context.request.json();
        const { project, isActive } = body;
        const activeStatus = isActive !== undefined ? isActive : true;
        
        try {
            if (activeStatus && project.ownerId) {
                const existsRes = await client.query(
                    'SELECT 1 FROM projects WHERE id = $1 AND is_active = TRUE', 
                    [project.id]
                );
                const isUpdate = existsRes.rowCount > 0;

                if (!isUpdate) {
                    const countRes = await client.query(
                        'SELECT COUNT(*) FROM projects WHERE owner_id = $1 AND is_active = TRUE',
                        [project.ownerId]
                    );
                    const currentCount = parseInt(countRes.rows[0].count);
                    
                    if (currentCount >= 3) {
                        return new Response(JSON.stringify({ error: "SLOTS_FULL", message: "Maximum 3 active projects allowed." }), { status: 403 });
                    }
                }
            }

            await client.query(
                `INSERT INTO projects (id, owner_id, title, is_active, data) 
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (id) DO UPDATE 
                 SET title = EXCLUDED.title, is_active = EXCLUDED.is_active, data = EXCLUDED.data, updated_at = NOW()`,
                [project.id, project.ownerId, project.title, activeStatus, JSON.stringify(project)]
            );
            return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
        } catch (e: any) {
            if (e.code === '42P01') {
                await ensureSchema();
                await client.query(
                    `INSERT INTO projects (id, owner_id, title, is_active, data) 
                     VALUES ($1, $2, $3, $4, $5)
                     ON CONFLICT (id) DO UPDATE 
                     SET title = EXCLUDED.title, is_active = EXCLUDED.is_active, data = EXCLUDED.data, updated_at = NOW()`,
                    [project.id, project.ownerId, project.title, activeStatus, JSON.stringify(project)]
                );
                return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
            }
            throw e;
        }
    }

    if (path.startsWith('projects/') && method === 'DELETE') {
        const projectId = path.split('/')[1];
        await client.query('DELETE FROM projects WHERE id = $1', [projectId]);
        return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response("Not Found", { status: 404 });

  } catch (error: any) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: error.message, code: error.code }), { status: 500 });
  } finally {
    context.waitUntil(client.end());
  }
};
