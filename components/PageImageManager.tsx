"use client";
import {useEffect,useState} from 'react';
import type {Content} from '@/lib/content';
import {artistPortrait,artistStudioPortrait} from '@/lib/content';
import {artworkCommunityPhotos,studioCommunityPhotos} from '@/lib/media';
import {defaultFraming,type ImageSetting} from '@/lib/image-settings';
import ImageEditor from './ImageEditor';
const pages=['Home','About','Artwork','Collections','Commissions','Exhibitions & Events','Community','Contact','Shared logos'] as const;
export default function PageImageManager({content,save,upload,busy,uploading,preview}:{
 content:Content;save:(c:Content)=>Promise<boolean>;upload:(f:File,key:string,set:(url:string)=>void)=>Promise<void>;busy:boolean;uploading:string;preview:boolean;
}){
 const [draft,setDraft]=useState(()=>structuredClone(content));
 const [page,setPage]=useState<typeof pages[number]>('Home');
 const [dirty,setDirty]=useState(false);
 useEffect(()=>{setDraft(structuredClone(content));setDirty(false)},[content.revision]);
 const library=[...new Map([...draft.artworks.filter(a=>a.image).map(a=>({src:a.image,label:a.title})),...studioCommunityPhotos.map((src,i)=>({src,label:'Community photo '+(i+1)})),{src:artistPortrait,label:'Artist portrait'},{src:artistStudioPortrait,label:'Artist in the studio'}].map(x=>[x.src,x])).values()];
 function update(fn:(c:Content)=>Content){setDraft(c=>fn(c));setDirty(true)}
 function image(key:string,label:string,src:string,fit:ImageSetting['fit']='contain',aspect=1.5,onSource?:(c:Content,url:string)=>void,logos=false){
  const value=draft.settings.pageImages[key]||{...defaultFraming,src,fit};
  return <ImageEditor key={key} label={label} value={value} aspect={aspect} logos={logos} library={library} uploading={Boolean(uploading)} upload={(f,set)=>upload(f,key,set)} onChange={value=>update(c=>{
   const next=structuredClone(c);next.settings.pageImages[key]=value;if(onSource)onSource(next,value.src);return next;
  })}/>;
 }
 function gallery(field:'homePhotos'|'collectionPhotos'|'communityPhotos'|'exhibitionPhotos',group:string,title:string){
  const photos=draft.settings[field];
  return <div className="page-gallery-editor"><h3>{title}</h3><p>Replace or frame individual photos, add a photo, or remove one from this page.</p><div className="page-image-grid">
   {photos.map((src,i)=><div key={i}>{image(group+'.photo.'+i,'Gallery photo '+(i+1),src,'cover',1.5,(c,url)=>{c.settings[field][i]=url})}<button type="button" className="text-link image-remove" onClick={()=>update(c=>{
    const next=structuredClone(c);next.settings[field].splice(i,1);
    for(let j=i;j<photos.length;j++){const following=next.settings.pageImages[group+'.photo.'+(j+1)];if(following)next.settings.pageImages[group+'.photo.'+j]=following;else delete next.settings.pageImages[group+'.photo.'+j]}
    delete next.settings.pageImages[group+'.photo.'+photos.length];return next;
   })}>Remove photo</button></div>)}
  </div><button type="button" className="button button-outline" disabled={photos.length>=100} onClick={()=>update(c=>({...c,settings:{...c.settings,[field]:[...c.settings[field],'']}}))}>Add gallery photo</button></div>;
 }
 return <div className="page-images-manager">
  <div className="admin-panel page-image-toolbar"><label>Choose a page<select value={page} onChange={e=>setPage(e.target.value as typeof page)}>{pages.map(p=><option key={p}>{p}</option>)}</select></label><p>Framing changes affect the website after saving. Portraits start with the full image visible. Artwork and collection covers are shared wherever those records appear.</p><button type="button" className="button button-dark" disabled={busy||Boolean(uploading)||!dirty} onClick={async()=>{if(await save(draft))setDirty(false)}}>{busy?'Saving…':preview?'Save image preview':'Publish image changes'}</button><span aria-live="polite">{dirty?'Unsaved image changes':'All image changes saved'}</span></div>
  <h2>{page}</h2>
  <div className="page-image-grid">
  {page==='Home'&&<>
   {image('home.hero','Homepage hero',draft.settings.heroImage,'cover',1.8,(c,url)=>{c.settings.heroImage=url})}
   {image('home.artist','About the Artist',draft.settings.portrait,'contain',1.15,(c,url)=>{c.settings.portrait=url})}
   {image('home.commission','Commission a Painting',draft.settings.studioImage,'cover',1)}
   {image('home.contact','Let’s Connect',draft.settings.studioImage,'cover',1.7)}
  </>}
  {page==='About'&&image('about.artist','The Artist Behind the Canvas',draft.settings.aboutPortrait,'contain',1019/1280,(c,url)=>{c.settings.aboutPortrait=url})}
  {page==='Commissions'&&image('commissions.studio','Studio photograph',draft.settings.studioImage,'cover',1.2)}
  {page==='Community'&&image('community.hero','Community hero',draft.settings.communityImage,'cover',2.5,(c,url)=>{c.settings.communityImage=url})}
  {page==='Shared logos'&&<>
   {image('brand.horizontal','Landscape logo','/images/kira-logo-horizontal.jpg','contain',2,undefined,true)}
   {image('brand.vertical','Portrait / mobile logo','/images/kira-logo-vertical.jpg','contain',1,undefined,true)}
  </>}
  {(page==='Artwork'||page==='Home')&&draft.artworks.filter(a=>page==='Artwork'||a.featured).map(a=><div key={a.id}>
   {image('artwork:'+a.id,a.title,a.image,'contain',.75,(c,url)=>{const item=c.artworks.find(x=>x.id===a.id);if(item){item.image=url;item.placeholder=false}})}
  </div>)}
  {(page==='Collections'||page==='Home')&&draft.collections.map(a=>image('collection:'+a.id,a.title+' cover',a.image,'cover',1,(c,url)=>{const item=c.collections.find(x=>x.id===a.id);if(item)item.image=url}))}
  {page==='Exhibitions & Events'&&draft.events.map(a=>image('event:'+a.id,a.title,a.image,'cover',1.5,(c,url)=>{const item=c.events.find(x=>x.id===a.id);if(item)item.image=url}))}
  </div>
  {page==='Home'&&<><div className="admin-panel featured-selection"><h3>Featured artwork</h3><p>Choose up to four published artworks for the homepage. Prices and availability can be changed in Artwork.</p>{draft.artworks.map(a=><label key={a.id} className="checkbox-label"><input type="checkbox" checked={a.featured} disabled={!a.featured&&draft.artworks.filter(x=>x.featured).length>=4} onChange={e=>update(c=>({...c,artworks:c.artworks.map(x=>x.id===a.id?{...x,featured:e.target.checked}:x)}))}/>{a.title}{!a.published?' (draft)':''}</label>)}</div>{gallery('homePhotos','home','Art & Community previews')}</>}
  {page==='Collections'&&gallery('collectionPhotos','collections','Art & Community previews')}
  {page==='Exhibitions & Events'&&gallery('exhibitionPhotos','exhibitions','Previous Exhibitions gallery')}
  {page==='Community'&&gallery('communityPhotos','community','Community photo previews')}
  {page==='Artwork'&&<div className="artwork-galleries-editor"><h3>Artwork detail galleries</h3>{draft.artworks.map(a=>{
   const photos=draft.settings.artworkPhotos[a.id]||artworkCommunityPhotos[a.slug]||[];
   return <details key={a.id}><summary>{a.title} · {photos.length} community photos</summary><div className="page-image-grid">{photos.map((src,i)=><div key={i}>{image('artwork-gallery:'+a.id+'.photo.'+i,a.title+' photo '+(i+1),src,'cover',1.5,(c,url)=>{const list=[...(c.settings.artworkPhotos[a.id]||artworkCommunityPhotos[a.slug]||[])];list[i]=url;c.settings.artworkPhotos[a.id]=list})}<button type="button" className="text-link image-remove" onClick={()=>update(c=>{
    const next=structuredClone(c);next.settings.artworkPhotos[a.id]=photos.filter((_,j)=>j!==i);
    for(let j=i;j<photos.length;j++){const key='artwork-gallery:'+a.id+'.photo.';const following=next.settings.pageImages[key+(j+1)];if(following)next.settings.pageImages[key+j]=following;else delete next.settings.pageImages[key+j]}return next;
   })}>Remove photo</button></div>)}</div><button type="button" className="button button-outline" disabled={photos.length>=30} onClick={()=>update(c=>({...c,settings:{...c.settings,artworkPhotos:{...c.settings.artworkPhotos,[a.id]:[...photos,'']}}}))}>Add photo</button></details>
  })}</div>}
  {page==='Contact'&&<div className="admin-panel"><h3>Contact page images</h3><p>This page uses the shared desktop and mobile logos. Choose Shared logos above to replace them. The contact forms accept text only.</p></div>}
 </div>
}
