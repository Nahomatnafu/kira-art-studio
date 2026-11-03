import 'server-only';
import {put} from '@vercel/blob';
import {mkdir,writeFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';
import {RequestError} from './request';
export async function uploadImage(file:File){
 if(!file.size||file.size>3*1024*1024)throw new RequestError(400,'Choose a JPG, PNG, or WebP image smaller than 3 MB.');
 let output:Buffer;
 try{
  const bytes=Buffer.from(await file.arrayBuffer());
  const input=sharp(bytes,{limitInputPixels:40000000,failOn:'warning'});
  const info=await input.metadata();
  if(!['jpeg','png','webp'].includes(info.format||'')||(info.pages||1)>1)throw new Error('Unsupported image');
  output=await input.rotate().resize({width:3200,height:3200,fit:'inside',withoutEnlargement:true}).webp({quality:88}).toBuffer();
 }catch{throw new RequestError(400,'This file could not be decoded. Choose a valid, still JPG, PNG, or WebP image.');}
 const filename=randomUUID()+'.webp';
 if(process.env.BLOB_READ_WRITE_TOKEN){
  const blob=await put('artwork/'+filename,output,{access:'public',contentType:'image/webp',addRandomSuffix:true});return blob.url;
 }
 if(process.env.KIRA_LOCAL_STORE==='1'&&process.env.NODE_ENV!=='production'){
  const directory=path.join(process.cwd(),'public','uploads');await mkdir(directory,{recursive:true});await writeFile(path.join(directory,filename),output);return '/uploads/'+filename;
 }
 throw new RequestError(503,'Image storage is not connected yet. You can use an HTTPS image URL instead.');
}
