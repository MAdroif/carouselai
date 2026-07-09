import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // 1. Tangani CORS pre-flight agar tidak error
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: { 
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" 
      } 
    })
  }

  try {
    const bodyText = await req.text()
    console.log("DEBUG: Raw request body:", bodyText)
    const { topic, slideCount, themePreference } = JSON.parse(bodyText)
    const authHeader = req.headers.get('Authorization')!

    // 2. Inisialisasi Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } }
      }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (!user) {
      console.log("DEBUG: User unauthorized", userError)
      return new Response(JSON.stringify({ error: 'Unauthorized', details: userError }), { status: 401 })
    }

    // 3. Cek Token
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('tokens')
      .eq('id', user.id)
      .single()

    if (!profile || profile.tokens <= 0) {
      console.log("DEBUG: Token habis untuk user", user.id)
      return new Response(JSON.stringify({ error: 'Token habis' }), { status: 403 })
    }

    // 4. Prompt Optimasi
    const safeTheme = themePreference && themePreference.trim() !== "" ? themePreference : "Minimalist Clean"
    const prompt = `Kamu adalah Art Director dan kreator konten carousel Instagram profesional. Tugasmu adalah membuat konten DAN komposisi visual untuk topik: "${topic}". Preferensi tema user: "${safeTheme}".
    KONTEN (WAJIB ${slideCount} slide):
    1 Konten harus dibangun menggunakan fungsi argumen berikut:
      - Hook
      - Premis
      - Cause Effect
      - Reframing
      - Assumption Reversal
      - Visualization
      - Identity Reframing
      - Paradox
      - Consequences
      - Analogy
      - Conclusion
      - Offer + CTA (opsional)
      Aturan:
      - Total jumlah sldie HARUS tepat ${slideCount} slide.
      - Satu slide dapat memuat lebih dari satu fungsi argumen jika masih mudah dipahami.
      - Gabungkan fungsi yang saling berkaitan untuk menjaga ritme.
      - Prioritaskan kejelasan dan alur logika tanpa mengurangi/menambah jumlah slide dari target ${slideCount}.
      ALUR LOGIKA:  
      - Setiap slide harus menjadi penyebab, bukti, konsekuensi, atau penjelasan dari slide sebelumnya.
      - Bangun satu rantai argumen yang terus bergerak menuju kesimpulan.
      - Hindari slide yang terasa seperti quote atau insight yang berdiri sendiri.
      - Audiens harus dapat mengikuti proses berpikir dari hook hingga kesimpulan tanpa lompatan logika.
    2. KOMPOSISI VISUAL (Standar Grid 1080x1080px):
      - Gunakan Safe Zone (Margin 5% dari tepi).
      - Alignment & Focus: Terapkan 'Art Director Directives' (alignment, focus, style, accent) pada setiap slide.
      - Hindari konten yang terlalu penuh (max 95% area kerja).
    3. PERATURAN MUTLAK KODE & FORMAT:
      - Output HARUS berupa JSON valid tanpa teks tambahan.
      - Setiap slide WAJIB memiliki field: 'svg_code', 'highlight_bg', dan 'highlights' (array).
      - 'svg_code' (Visual Aesthetic Guide):
        - DILARANG membuat objek literal (seperti robot, otak, lampu, atau icon benda).
        - Buat elemen visual abstrak sebagai pelengkap estetika, bukan icon terpusat.
        - Pilih salah satu gaya: 
          1. Atmospheric: Bentuk blob/lingkaran besar dengan radial-gradient transparan yang terpotong di pinggir canvas (bleed).
          2. Schematic: Garis tipis, dot-grid, atau Bezier curves dengan stroke-dasharray untuk kesan blueprint/arsitektur.
        - Gunakan format <svg viewBox='0 0 100 100'>, gunakan 'currentColor', pastikan tag tertutup.
      - 'highlight_bg': Gunakan warna HEX valid (contoh: #FFD700) dengan 100% transparansi dan kontras dari warna bg.
      - 'highlights': Minimal satu frasa penting per slide harus masuk dalam array ini. array HARUS berupa substring persis sama dengan body_text. JANGAN memparafrase, JANGAN meringkas, JANGAN mengubah urutan kata, Salin frasa tersebut PERSIS seperti yang muncul di body_text.
      Struktur JSON: {
        "theme": {
          "name", "bg", "bgAlt", "accent", "accentText", "text", "textMuted", "highlight", "fontWeight", "gradient"
        },
        "slides": [{
          "slide": number, "composition": {
            "alignment", "focus", "style", "accent"
          },
          "title": string,
          "body_text": string,
          "image_keyword": string,
          "svg_code": string,
          "highlights": string[],
          "highlight_bg": string
        }]
      }`

    // 5. Panggil Gemini dengan Fallback
    const models = ["gemini-3.5-flash", "gemini-3.1-flash-lite"]
    let response
    let data

    for (const model of models) {
      console.log(`DEBUG: Mencoba memanggil model: ${model}`)
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${Deno.env.get('GEMINI_API_KEY')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            thinkingConfig: {
              thinkingBudget: 2048
            },
            temperature: 1.0
          }
        })
      })

      if (response.ok) {
        data = await response.json()
        break
      } else {
        console.log(`DEBUG: Model ${model} gagal: ${await response.text()}`)
      }
    }

    if (!data) {
      throw new Error("Semua model Gemini gagal dipanggil.")
    }

    let text = data.candidates[0].content.parts[0].text

    // Pembersihan teks manual
    if (text.startsWith('```json')) text = text.slice(7);
    else if (text.startsWith('```')) text = text.slice(3);
    if (text.endsWith('```')) text = text.slice(0, -3);

    const parsedData = JSON.parse(text.trim())

    // 6. Kurangi Token
    await supabaseClient
      .from('profiles')
      .update({ tokens: profile.tokens - 1 })
      .eq('id', user.id)

    return new Response(JSON.stringify(parsedData), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    })

  } catch (e) {
    console.error("DEBUG: CATCH ERROR:", e)
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    })
  }
})
