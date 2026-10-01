import {db,identity,error,title,noCache} from '../../../db/raw';
export async function GET(req:Request){try{const owner=await identity(req);const data=await db().prepare('SELECT * FROM items WHERE owner=? ORDER BY created DESC').bind(owner).all();return Response.json(data.results,{headers:noCache});}catch(e){return error(e);}}
export async function POST(req:Request){try{const owner=await identity(req,true);const b=await req.json() as Record<string,unknown>;if(!['task','link'].includes(String(b.kind))||!title(b.title))return Response.json({error:'اكتب عنواناً أولاً'},{status:400});let url='';if(b.kind==='link'){try{const u=new URL(String(b.url));if(!['https:','http:'].includes(u.protocol)||u.username||u.password)throw 0;url=u.href;}catch{return Response.json({error:'أدخل رابطاً صحيحاً يبدأ بـ https://'},{status:400});}}const id=crypto.randomUUID();await db().prepare('INSERT INTO items (id,owner,kind,title,url,note,done,deleted,created) VALUES (?,?,?,?,?,?,0,0,?)').bind(id,owner,String(b.kind),title(b.title),url,title(b.note,2000),Date.now()).run();return Response.json({id},{status:201});}catch(e){return error(e);}}
export async function PATCH(req:Request){try{
 const owner=await identity(req,true),b=await req.json() as Record<string,unknown>;
 if(typeof b.id!=='string')return Response.json({error:'العنصر غير صالح'},{status:400});
 const old=await db().prepare('SELECT kind FROM items WHERE id=? AND owner=?').bind(b.id,owner).first();
 if(!old)return Response.json({error:'لم يعد العنصر متاحاً'},{status:404});
 const fields:string[]=[],values:(string|number)[]=[];
 if(b.title!==undefined){const t=title(b.title);if(!t)return Response.json({error:'العنوان مطلوب'},{status:400});fields.push('title=?');values.push(t);}
 if(b.note!==undefined){fields.push('note=?');values.push(title(b.note,2000));}
 if(b.url!==undefined&&old.kind==='link'){try{const u=new URL(String(b.url));if(!['https:','http:'].includes(u.protocol)||u.username||u.password)throw 0;fields.push('url=?');values.push(u.href);}catch{return Response.json({error:'الرابط غير صالح'},{status:400});}}
 for(const key of ['done','deleted'])if(b[key]!==undefined){if(typeof b[key]!=='boolean')return Response.json({error:'القيمة غير صالحة'},{status:400});fields.push(key+'=?');values.push(b[key]?1:0);}
 if(fields.length)await db().prepare('UPDATE items SET '+fields.join(',')+' WHERE id=? AND owner=?').bind(...values,b.id,owner).run();
 return Response.json({ok:true});
 }catch(e){return error(e);}}
