import {NextResponse} from 'next/server';
import {isAdmin,sameAdminOrigin,rateLimit} from '@/lib/auth';
import {uploadImage} from '@/lib/uploads';
import {readUploadForm,RequestError} from '@/lib/request';
export async function POST(req:Request){
 if(!sameAdminOrigin(req)||!await isAdmin())return NextResponse.json({error:'Please sign in.'},{status:403});
 try{
 if(!await rateLimit(req,'admin-upload',60,3600))return NextResponse.json({error:'You have reached the hourly upload limit.'},{status:429,headers:{'Retry-After':'3600'}});
 const form=await readUploadForm(req,3*1024*1024+16384);
 if([...form.keys()].some(k=>k!=='file')||form.getAll('file').length!==1)throw new RequestError(400,'Upload one image at a time.');
 const file=form.get('file');if(!(file instanceof File))throw new RequestError(400,'Please select an image.');
 return NextResponse.json({url:await uploadImage(file)});
 }catch(e){if(e instanceof RequestError)return NextResponse.json({error:e.message},{status:e.status});return NextResponse.json({error:'The image could not be uploaded. Please try again.'},{status:503});}
}
