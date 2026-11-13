import 'server-only';
import {createHmac,createHash,timingSafeEqual,randomBytes} from 'node:crypto';
import {isIP} from 'node:net';
import {cookies,headers} from 'next/headers';
import {neon} from '@neondatabase/serverless';
import {siteOrigin} from './site';
const adminHost = new URL(siteOrigin).host;
const SESSION_MS=8*60*60*1000;
export const sessionCookieName=()=>process.env.NODE_ENV==='production'?'__Host-kira_session':'kira_session';
export const authReady=()=>Boolean(process.env.ADMIN_PASSWORD&&process.env.ADMIN_PASSWORD.length>=16&&process.env.SESSION_SECRET&&process.env.SESSION_SECRET.length>=32);
const digest=(s:string)=>createHash('sha256').update(s).digest();
export const checkPassword=(s:string)=>authReady()&&timingSafeEqual(digest(s),digest(process.env.ADMIN_PASSWORD!));
function sign(s:string){return createHmac('sha256',process.env.SESSION_SECRET!+createHash('sha256').update(process.env.ADMIN_PASSWORD!).digest('hex')).update(s).digest('base64url');}
function verifyToken(value:string){
  if(!authReady()||value.length>256)return null;
  const parts=value.split('.');if(parts.length!==3||!/^\d{13}$/.test(parts[0])||!/^[-a-zA-Z0-9_]{43}$/.test(parts[2])||! /^[a-f0-9]{64}$/.test(parts[1]))return null;
  const expires=Number(parts[0]);if(expires<=Date.now()||expires>Date.now()+SESSION_MS+60000)return null;
  const a=Buffer.from(parts[2]),b=Buffer.from(sign(parts.slice(0,2).join('.')));
  return a.length===b.length&&timingSafeEqual(a,b)?{id:parts[1],expires}:null;
}
const local=globalThis as typeof globalThis & {kiraSessions?:Map<string,number>;kiraLimits?:Map<string,{count:number;expires:number}>};
const localSessions=()=>local.kiraSessions??=(new Map());
const sessionKey=(id:string)=>digest(id).toString('hex');
export async function createSession(){
  const expires=Date.now()+SESSION_MS,id=randomBytes(32).toString('hex');
  if(process.env.DATABASE_URL){const sql=neon(process.env.DATABASE_URL);await sql`CREATE TABLE IF NOT EXISTS kira_admin_sessions (id_hash text PRIMARY KEY, expires timestamptz NOT NULL)`;await sql`DELETE FROM kira_admin_sessions WHERE expires<NOW()`;await sql`INSERT INTO kira_admin_sessions(id_hash,expires) VALUES(${sessionKey(id)},${new Date(expires).toISOString()}::timestamptz)`;}
  else if(process.env.NODE_ENV!=='production'){for(const [key,time]of localSessions())if(time<Date.now())localSessions().delete(key);localSessions().set(sessionKey(id),expires);}
  else throw new Error('Session storage is unavailable');
  const payload=`${expires}.${id}`;return `${payload}.${sign(payload)}`;
}
export async function isAdmin(){
  if(!adminHostAllowed(await headers()))return false;
  const token=verifyToken((await cookies()).get(sessionCookieName())?.value||'');if(!token)return false;
  try{if(process.env.DATABASE_URL){const sql=neon(process.env.DATABASE_URL);const rows=await sql`SELECT id_hash FROM kira_admin_sessions WHERE id_hash=${sessionKey(token.id)} AND expires>NOW()`;return rows.length===1;}
    return process.env.NODE_ENV!=='production'&&(localSessions().get(sessionKey(token.id))||0)>Date.now();
  }catch{return false;}
}
export async function revokeSession(){
  const token=verifyToken((await cookies()).get(sessionCookieName())?.value||'');if(!token)return;
  if(process.env.DATABASE_URL){const sql=neon(process.env.DATABASE_URL);await sql`DELETE FROM kira_admin_sessions WHERE id_hash=${sessionKey(token.id)}`;}
  else if(process.env.NODE_ENV!=='production')localSessions().delete(sessionKey(token.id));
}
export function adminHostAllowed(headers:Headers){
  if(process.env.VERCEL !== '1')return true;
  return process.env.VERCEL_ENV === 'production' && headers.get('host') === adminHost;
}
export function sameAdminOrigin(req:Request){
  return adminHostAllowed(req.headers) && (process.env.VERCEL === '1'
    ? req.headers.get('origin') === siteOrigin && req.headers.get('sec-fetch-site') !== 'cross-site'
    : sameOrigin(req));
}
export function sameOrigin(req:Request){
  try{if(req.headers.get('sec-fetch-site')==='cross-site')return false;const raw=req.headers.get('origin');if(!raw)return false;const origin=new URL(raw),url=new URL(req.url);const host=req.headers.get('host')||url.host;const protocol=(req.headers.get('x-forwarded-proto')?.split(',')[0]||url.protocol.replace(':',''))+':';return origin.origin===`${protocol}//${host}`;}catch{return false;}
}
let lastCleanup=0;
export async function rateLimit(req:Request,kind:string,max:number,windowSeconds:number,scope:'ip'|'global'='ip'){
  const forwarded=(process.env.VERCEL==='1'?req.headers.get('x-vercel-forwarded-for'):null)?.split(',')[0].trim()||'';
  const ip=scope==='global'?'global':isIP(forwarded)?forwarded:'unknown';
  const key=createHmac('sha256',process.env.SESSION_SECRET||'local-preview').update(kind+':'+ip).digest('hex');
  if(process.env.DATABASE_URL){const sql=neon(process.env.DATABASE_URL);await sql`CREATE TABLE IF NOT EXISTS kira_rate_limits (key text PRIMARY KEY, count integer NOT NULL, expires timestamptz NOT NULL)`;
    if(Date.now()-lastCleanup>300000){await sql`CREATE INDEX IF NOT EXISTS kira_rate_limits_expiry ON kira_rate_limits(expires)`;await sql`DELETE FROM kira_rate_limits WHERE expires<NOW()`;lastCleanup=Date.now();}
    const rows=await sql`INSERT INTO kira_rate_limits(key,count,expires) VALUES(${key},1,NOW()+${windowSeconds}*interval '1 second') ON CONFLICT(key) DO UPDATE SET count=CASE WHEN kira_rate_limits.expires<NOW() THEN 1 ELSE kira_rate_limits.count+1 END,expires=CASE WHEN kira_rate_limits.expires<NOW() THEN NOW()+${windowSeconds}*interval '1 second' ELSE kira_rate_limits.expires END RETURNING count`;return rows[0].count<=max;
  }
  if(process.env.NODE_ENV==='production')return false;
  const limits=local.kiraLimits??=(new Map());for(const [key,value]of limits)if(value.expires<Date.now())limits.delete(key);
  const value=limits.get(key);if(!value){if(limits.size>10000)return false;limits.set(key,{count:1,expires:Date.now()+windowSeconds*1000});return true;}value.count++;return value.count<=max;
}
