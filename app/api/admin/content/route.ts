import {NextResponse} from 'next/server';
import {isAdmin,sameAdminOrigin,rateLimit} from '@/lib/auth';
import {readContent,saveContent} from '@/lib/store';
import {contentWriteSchema} from '@/lib/content-write';
import {readJson,RequestError} from '@/lib/request';
export async function GET(){if(!await isAdmin())return NextResponse.json({error:'Please sign in.'},{status:401});try{return NextResponse.json(await readContent(),{headers:{'Cache-Control':'private, no-store'}});}catch{return NextResponse.json({error:'Could not load studio content.'},{status:503});}}
export async function PUT(req:Request){
 if(!sameAdminOrigin(req)||!await isAdmin())return NextResponse.json({error:'Please sign in again.'},{status:403});
 try{const parsed=contentWriteSchema.safeParse(await readJson(req,1000000));if(!parsed.success)return NextResponse.json({error:parsed.error.issues.slice(0,8).map(x=>x.path.join('.')+': '+x.message).join('; ')},{status:400});
 if(!await rateLimit(req,'content-write',60,60))return NextResponse.json({error:'Please wait a minute before saving again.'},{status:429,headers:{'Retry-After':'60'}});
 return NextResponse.json(await saveContent(parsed.data));
 }catch(e){if(e instanceof RequestError)return NextResponse.json({error:e.message},{status:e.status});if((e as Error).message==='CONFLICT')return NextResponse.json({error:'Another editor saved changes. Reload the dashboard before trying again.'},{status:409});return NextResponse.json({error:'Could not save your changes. Please try again.'},{status:503});}
}
