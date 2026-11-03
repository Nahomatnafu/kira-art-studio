import {NextRequest,NextResponse} from 'next/server';
export function proxy(request:NextRequest){
 const nonce=Buffer.from(crypto.randomUUID()).toString('base64');
 const dev=process.env.NODE_ENV==='development';
 const secure=request.nextUrl.protocol==='https:'||request.headers.get('x-forwarded-proto')==='https';
 const policy=["default-src 'self'","script-src 'self' 'nonce-"+nonce+"' 'strict-dynamic'"+(dev?" 'unsafe-eval'":''),"style-src 'self' 'unsafe-inline'","img-src 'self' https: data: blob:","font-src 'self'","connect-src 'self'"+(dev?' ws: wss:':''),"media-src 'self' https:","object-src 'none'","frame-src 'none'","base-uri 'self'","form-action 'self'","frame-ancestors 'none'",...(secure?['upgrade-insecure-requests']:[])].join('; ');
 const headers=new Headers(request.headers);headers.set('x-nonce',nonce);headers.set('Content-Security-Policy',policy);
 const response=NextResponse.next({request:{headers}});response.headers.set('Content-Security-Policy',policy);
 if(secure)response.headers.set('Strict-Transport-Security','max-age=31536000');return response;
}
export const config={matcher:['/((?!api|_next/static|_next/image|images/|uploads/|favicon.ico|icon.jpg).*)']};
