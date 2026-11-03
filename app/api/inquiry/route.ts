import {NextResponse} from 'next/server';
import {z} from 'zod';
import {rateLimit,sameOrigin} from '@/lib/auth';
import {hasStore} from '@/lib/store';
import {readJson,RequestError} from '@/lib/request';
const categories=['','Painting','Digital Art','T-shirt','Bag','3D','Collaborating with the studio','Youth art activities','Paint & Wine','Hike & Paint','Adult art gatherings'] as const;
const schema=z.object({kind:z.enum(['contact','commission','community','experience']),name:z.string().trim().min(2).max(120).regex(/^[^\u0000-\u001f\u007f]+$/),email:z.email().max(254),phone:z.string().trim().max(40).regex(/^[0-9+().\s#xX-]*$/).default(''),size:z.string().trim().max(100).default(''),category:z.enum(categories).default(''),message:z.string().trim().min(10).max(6000).refine(s=>!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(s)),website:z.string().max(200).default('')}).strict().refine(s=>s.kind!=='commission'||['Painting','Digital Art','T-shirt','Bag','3D'].includes(s.category),'Please choose a commission category.');
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
