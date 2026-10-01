import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../app/chatgpt-auth';
export function db(){if(!env.DB)throw new Error('Database unavailable');return env.DB;}
export function bucket(){if(!env.BUCKET)throw new Error('Storage unavailable');return env.BUCKET;}
export async function identity(req:Request,write=false){const u=await getChatGPTUser();if(!u)throw new Error('UNAUTHORIZED');if(write){const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)throw new Error('FORBIDDEN');}return u.userId;}
export function error(e:unknown){console.error('World API',e);const m=e instanceof Error?e.message:'';return Response.json({error:m==='UNAUTHORIZED'?'انتهت الجلسة. أعد تحميل الصفحة':m==='FORBIDDEN'?'الطلب غير مسموح':'تعذر الحفظ الآن. حاول مرة أخرى'},{status:m==='UNAUTHORIZED'?401:m==='FORBIDDEN'?403:500});}
export function title(v:unknown,max=160){return typeof v==='string'?v.trim().slice(0,max):'';}
export const noCache={'Cache-Control':'private, no-store'};
