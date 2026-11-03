import {NextResponse} from 'next/server';
import {z} from 'zod';
import {authReady,checkPassword,createSession,isAdmin,rateLimit,sameOrigin,revokeSession,sessionCookieName} from '@/lib/auth';
import {hasStore} from '@/lib/store';
import {readJson,RequestError} from '@/lib/request';
const loginSchema=z.object({password:z.string().min(1).max(500)}).strict();
const cookieOptions=()=>({httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict' as const,path:'/',maxAge:28800});
export async function GET(){return NextResponse.json({authenticated:await isAdmin(),configured:authReady()&&hasStore()},{headers:{'Cache-Control':'private, no-store'}});}
export async function POST(req:Request){
 if(!sameOrigin(req))return NextResponse.json({error:'Invalid request origin.'},{status:403});
 if(!authReady()||!hasStore())return NextResponse.json({error:'Admin access is waiting for the database and secure login configuration.'},{status:503});
 try{
  const parsed=loginSchema.safeParse(await readJson(req,4096));if(!parsed.success)return NextResponse.json({error:'Please enter a valid password.'},{status:400});
  if(!await rateLimit(req,'login',5,900)||!await rateLimit(req,'login-global',50,900,'global'))return NextResponse.json({error:'Too many attempts. Please try again in 15 minutes.'},{status:429,headers:{'Retry-After':'900'}});
  if(!checkPassword(parsed.data.password))return NextResponse.json({error:'The password is incorrect.'},{status:401});
  const response=NextResponse.json({ok:true});response.cookies.set(sessionCookieName(),await createSession(),cookieOptions());return response;
 }catch(e){if(e instanceof RequestError)return NextResponse.json({error:e.message},{status:e.status});return NextResponse.json({error:'Sign-in is temporarily unavailable. Please try again.'},{status:503});}
}
export async function DELETE(req:Request){
 if(!sameOrigin(req))return new Response(null,{status:403});
 try{await revokeSession();const response=NextResponse.json({ok:true});response.cookies.set(sessionCookieName(),'',{...cookieOptions(),maxAge:0});return response;}
 catch{return NextResponse.json({error:'Could not sign out. Please try again.'},{status:503});}
}
