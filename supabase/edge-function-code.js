"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var server_ts_1 = require("https://deno.land/std@0.168.0/http/server.ts");
var supabase_js_2_1 = require("https://esm.sh/@supabase/supabase-js@2");
(0, server_ts_1.serve)(function (req) { return __awaiter(void 0, void 0, void 0, function () {
    var bodyText, _a, topic, slideCount, themePreference, authHeader, supabaseClient, _b, user, userError, profile, safeTheme, prompt, models, response, data, _i, models_1, model, _c, _d, _e, _f, text, parsedData, e_1;
    var _g, _h;
    return __generator(this, function (_j) {
        switch (_j.label) {
            case 0:
                // 1. Tangani CORS pre-flight agar tidak error
                if (req.method === 'OPTIONS') {
                    return [2 /*return*/, new Response('ok', {
                            headers: {
                                "Access-Control-Allow-Origin": "*",
                                "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
                            }
                        })];
                }
                _j.label = 1;
            case 1:
                _j.trys.push([1, 13, , 14]);
                return [4 /*yield*/, req.text()];
            case 2:
                bodyText = _j.sent();
                console.log("DEBUG: Raw request body:", bodyText);
                _a = JSON.parse(bodyText), topic = _a.topic, slideCount = _a.slideCount, themePreference = _a.themePreference;
                authHeader = req.headers.get('Authorization');
                supabaseClient = (0, supabase_js_2_1.createClient)((_g = Deno.env.get('SUPABASE_URL')) !== null && _g !== void 0 ? _g : '', (_h = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) !== null && _h !== void 0 ? _h : '', {
                    global: { headers: { Authorization: authHeader } }
                });
                return [4 /*yield*/, supabaseClient.auth.getUser()];
            case 3:
                _b = _j.sent(), user = _b.data.user, userError = _b.error;
                if (!user) {
                    console.log("DEBUG: User unauthorized", userError);
                    return [2 /*return*/, new Response(JSON.stringify({ error: 'Unauthorized', details: userError }), { status: 401 })];
                }
                return [4 /*yield*/, supabaseClient
                        .from('profiles')
                        .select('tokens')
                        .eq('id', user.id)
                        .single()];
            case 4:
                profile = (_j.sent()).data;
                if (!profile || profile.tokens <= 0) {
                    console.log("DEBUG: Token habis untuk user", user.id);
                    return [2 /*return*/, new Response(JSON.stringify({ error: 'Token habis' }), { status: 403 })];
                }
                safeTheme = themePreference && themePreference.trim() !== "" ? themePreference : "Minimalist Clean";
                prompt = "Kamu adalah Art Director dan kreator konten carousel Instagram profesional. Tugasmu adalah membuat konten DAN komposisi visual untuk topik: \"".concat(topic, "\". Preferensi tema user: \"").concat(safeTheme, "\".\n    KONTEN (WAJIB ").concat(slideCount, " slide):\n    1 Konten harus dibangun menggunakan fungsi argumen berikut:\n      - Hook\n      - Premis\n      - Cause Effect\n      - Reframing\n      - Assumption Reversal\n      - Visualization\n      - Identity Reframing\n      - Paradox\n      - Consequences\n      - Analogy\n      - Conclusion\n      - Offer + CTA (opsional)\n      Aturan:\n      - Total jumlah sldie HARUS tepat ").concat(slideCount, " slide.\n      - Satu slide dapat memuat lebih dari satu fungsi argumen jika masih mudah dipahami.\n      - Gabungkan fungsi yang saling berkaitan untuk menjaga ritme.\n      - Prioritaskan kejelasan dan alur logika tanpa mengurangi/menambah jumlah slide dari target ").concat(slideCount, ".\n      ALUR LOGIKA:  \n      - Setiap slide harus menjadi penyebab, bukti, konsekuensi, atau penjelasan dari slide sebelumnya.\n      - Bangun satu rantai argumen yang terus bergerak menuju kesimpulan.\n      - Hindari slide yang terasa seperti quote atau insight yang berdiri sendiri.\n      - Audiens harus dapat mengikuti proses berpikir dari hook hingga kesimpulan tanpa lompatan logika.\n    2. KOMPOSISI VISUAL (Standar Grid 1080x1080px):\n      - Gunakan Safe Zone (Margin 5% dari tepi).\n      - Alignment & Focus: Terapkan 'Art Director Directives' (alignment, focus, style, accent) pada setiap slide.\n      - Hindari konten yang terlalu penuh (max 95% area kerja).\n    3. PERATURAN MUTLAK KODE & FORMAT:\n      - Output HARUS berupa JSON valid tanpa teks tambahan.\n      - Setiap slide WAJIB memiliki field: 'svg_code', 'highlight_bg', dan 'highlights' (array).\n      - 'svg_code' (Visual Aesthetic Guide):\n        - DILARANG membuat objek literal (seperti robot, otak, lampu, atau icon benda).\n        - Buat elemen visual abstrak sebagai pelengkap estetika, bukan icon terpusat.\n        - Pilih salah satu gaya: \n          1. Atmospheric: Bentuk blob/lingkaran besar dengan radial-gradient transparan yang terpotong di pinggir canvas (bleed).\n          2. Schematic: Garis tipis, dot-grid, atau Bezier curves dengan stroke-dasharray untuk kesan blueprint/arsitektur.\n        - Gunakan format <svg viewBox='0 0 100 100'>, gunakan 'currentColor', pastikan tag tertutup.\n      - 'highlight_bg': Gunakan warna HEX valid (contoh: #FFD700) dengan 100% transparansi dan kontras dari warna bg.\n      - 'highlights': Minimal satu frasa penting per slide harus masuk dalam array ini. array HARUS berupa substring persis sama dengan body_text. JANGAN memparafrase, JANGAN meringkas, JANGAN mengubah urutan kata, Salin frasa tersebut PERSIS seperti yang muncul di body_text.\n      Struktur JSON: {\n        \"theme\": {\n          \"name\", \"bg\", \"bgAlt\", \"accent\", \"accentText\", \"text\", \"textMuted\", \"highlight\", \"fontWeight\", \"gradient\"\n        },\n        \"slides\": [{\n          \"slide\": number, \"composition\": {\n            \"alignment\", \"focus\", \"style\", \"accent\"\n          },\n          \"title\": string,\n          \"body_text\": string,\n          \"image_keyword\": string,\n          \"svg_code\": string,\n          \"highlights\": string[],\n          \"highlight_bg\": string\n        }]\n      }");
                models = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
                response = void 0;
                data = void 0;
                _i = 0, models_1 = models;
                _j.label = 5;
            case 5:
                if (!(_i < models_1.length)) return [3 /*break*/, 11];
                model = models_1[_i];
                console.log("DEBUG: Mencoba memanggil model: ".concat(model));
                return [4 /*yield*/, fetch("https://generativelanguage.googleapis.com/v1beta/models/".concat(model, ":generateContent?key=").concat(Deno.env.get('GEMINI_API_KEY')), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                    })];
            case 6:
                response = _j.sent();
                if (!response.ok) return [3 /*break*/, 8];
                return [4 /*yield*/, response.json()];
            case 7:
                data = _j.sent();
                return [3 /*break*/, 11];
            case 8:
                _d = (_c = console).log;
                _f = (_e = "DEBUG: Model ".concat(model, " gagal: ")).concat;
                return [4 /*yield*/, response.text()];
            case 9:
                _d.apply(_c, [_f.apply(_e, [_j.sent()])]);
                _j.label = 10;
            case 10:
                _i++;
                return [3 /*break*/, 5];
            case 11:
                if (!data) {
                    throw new Error("Semua model Gemini gagal dipanggil.");
                }
                text = data.candidates[0].content.parts[0].text;
                // Pembersihan teks manual
                if (text.startsWith('```json'))
                    text = text.slice(7);
                else if (text.startsWith('```'))
                    text = text.slice(3);
                if (text.endsWith('```'))
                    text = text.slice(0, -3);
                parsedData = JSON.parse(text.trim());
                // 6. Kurangi Token
                return [4 /*yield*/, supabaseClient
                        .from('profiles')
                        .update({ tokens: profile.tokens - 1 })
                        .eq('id', user.id)];
            case 12:
                // 6. Kurangi Token
                _j.sent();
                return [2 /*return*/, new Response(JSON.stringify(parsedData), {
                        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
                    })];
            case 13:
                e_1 = _j.sent();
                console.error("DEBUG: CATCH ERROR:", e_1);
                return [2 /*return*/, new Response(JSON.stringify({ error: e_1.message }), {
                        status: 400,
                        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
                    })];
            case 14: return [2 /*return*/];
        }
    });
}); });
