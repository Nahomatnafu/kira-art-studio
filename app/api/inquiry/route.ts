import {NextResponse} from 'next/server';
import {z} from 'zod';
import {rateLimit,sameOrigin} from '@/lib/auth';
import {hasStore} from '@/lib/store';
import {readJson,RequestError} from '@/lib/request';
import {commissionCategories,communityCategories} from "@/lib/inquiry-options";
import {singleLine,multiline,phoneNumber} from "@/lib/input";
const categories = ["", ...commissionCategories, ...communityCategories] as const;
const schema = z.strictObject({
  kind: z.enum(["contact", "commission", "community", "experience"]),
  name: z.string().refine(singleLine).trim().min(2).max(120),
  email: z.email().max(254),
  phone: z.string().refine(singleLine).trim().max(40).refine(phoneNumber).default(""),
  size: z.string().refine(singleLine).trim().max(100).default(""),
  category: z.enum(categories).default(""),
  message: z.string().refine(multiline).trim().min(10).max(6000),
  website: z.string().max(200).default(""),
}).refine(data => {
  if (data.kind === "commission") return commissionCategories.some(value => value === data.category);
  if (data.size) return false;
  return !data.category || data.kind === "community" && communityCategories.some(value => value === data.category);
});
export async function POST(req:Request){
 if(!sameOrigin(req))return NextResponse.json({error:'Invalid request origin.'},{status:403});
 try{
  const parsed=schema.safeParse(await readJson(req,32768));
  if(!parsed.success)return NextResponse.json({error:'Please check your name, email, category, and message. Only text fields are accepted.'},{status:400});
  const data=parsed.data;if(data.website)return NextResponse.json({error:'Unable to submit this request.'},{status:400});
  if(!process.env.RESEND_API_KEY||!process.env.CONTACT_TO_EMAIL||!process.env.CONTACT_FROM_EMAIL||!hasStore())return NextResponse.json({error:'The studio contact form is being connected. Please check back soon.'},{status:503});
  if(!await rateLimit(req,'inquiry',5,3600))return NextResponse.json({error:'You have reached the hourly message limit. Please try again later.'},{status:429,headers:{'Retry-After':'3600'}});
  if(!await rateLimit(req,'inquiry-daily',100,86400,'global'))return NextResponse.json({error:'The studio has reached its daily message limit. Please try again tomorrow.'},{status:429,headers:{'Retry-After':'86400'}});
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.CONTACT_FROM_EMAIL,to:[process.env.CONTACT_TO_EMAIL],reply_to:data.email,subject:'KIRA '+data.kind+' inquiry · '+data.name,text:['Name: '+data.name,'Email: '+data.email,'Phone: '+(data.phone||'Not supplied'),'Size: '+(data.size||'Not supplied'),'Category: '+(data.category||'Not supplied'),'',data.message].join('\n')}),signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw new Error('Email provider failed');
  return NextResponse.json({ok:true,message:'Thank you for reaching out. Your message is on its way to the studio. We look forward to connecting with you.'});
 }catch(e){if(e instanceof RequestError)return NextResponse.json({error:e.message},{status:e.status});return NextResponse.json({error:'Your message could not be sent. Please try again shortly.'},{status:502});}
}
