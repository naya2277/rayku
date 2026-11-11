// Deploy with: supabase functions deploy chef-rayku
// Set GEMINI_API_KEY in Supabase Edge Function secrets (never VITE_).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const cors = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS'}
Deno.serve(async (req) => {
  if(req.method==='OPTIONS') return new Response('ok',{headers:cors})
  if(req.method!=='POST') return new Response('Method not allowed',{status:405,headers:cors})
  try {
    const authorization=req.headers.get('Authorization')
    if(!authorization?.startsWith('Bearer ')) return new Response('Unauthorized',{status:401,headers:cors})
    const client=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:authorization}}})
    const {data:{user},error}=await client.auth.getUser()
    if(error||!user) return new Response('Unauthorized',{status:401,headers:cors})
    const {prompt}=await req.json()
    if(typeof prompt!=='string'||!prompt.trim()||prompt.length>24000) return new Response('Invalid prompt',{status:400,headers:cors})
    const apiKey=Deno.env.get('GEMINI_API_KEY')
    if(!apiKey) return new Response('Gemini not configured',{status:503,headers:cors})
    const result=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',{
      method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':apiKey},
      body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{responseMimeType:'application/json',temperature:0.7}})
    })
    if(!result.ok) return new Response('Gemini unavailable',{status:502,headers:cors})
    const data=await result.json()
    const text=data.candidates?.[0]?.content?.parts?.map((p:{text?:string})=>p.text??'').join('')??''
    if(!text) return new Response('Empty response',{status:502,headers:cors})
    return new Response(JSON.stringify({text}),{headers:{...cors,'Content-Type':'application/json'}})
  }catch{return new Response('Generation failed',{status:500,headers:cors})}
})
