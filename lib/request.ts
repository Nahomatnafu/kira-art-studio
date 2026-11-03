import 'server-only';
export class RequestError extends Error {
  constructor(public status:number,message:string){super(message);}
}
// Count streamed bytes; Content-Length is only an early rejection hint.
export async function readLimitedBody(req:Request,maxBytes:number):Promise<Uint8Array>{
  const declared=req.headers.get('content-length');
  if(declared!==null&&(!/^\d+$/.test(declared)||Number(declared)>maxBytes))throw new RequestError(413,'The request is too large.');
  if(!req.body)return new Uint8Array();
  const reader=req.body.getReader();const chunks:Uint8Array[]=[];let length=0,expired=false;
  const timeout=setTimeout(()=>{expired=true;void reader.cancel();},10000);
  try {while(true){const {done,value}=await reader.read();if(expired)throw new RequestError(408,'The request timed out. Please try again.');if(done)break;length+=value.byteLength;if(length>maxBytes){await reader.cancel();throw new RequestError(413,'The request is too large.');}chunks.push(value);}}
  finally{clearTimeout(timeout);reader.releaseLock();}
  const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}return bytes;
}
export async function readJson(req:Request,maxBytes:number):Promise<unknown>{
  if(req.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='application/json')throw new RequestError(415,'This form accepts text-only JSON requests. Attachments are not supported.');
  const bytes=await readLimitedBody(req,maxBytes);
  try{return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}catch{throw new RequestError(400,'The request contains invalid JSON.');}
}
export async function readUploadForm(req:Request,maxBytes:number):Promise<FormData>{
  const type=req.headers.get('content-type')||'';
  if(!type.toLowerCase().startsWith('multipart/form-data;'))throw new RequestError(415,'Please select an image using the upload control.');
  const bytes=await readLimitedBody(req,maxBytes);
  try{return await new Response(bytes as BodyInit,{headers:{'Content-Type':type}}).formData();}catch{throw new RequestError(400,'The upload request is invalid.');}
}
