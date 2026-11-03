"use client";
import {useEffect,useRef,useState} from 'react';
import {artworkCrops} from '@/lib/artwork-images';
import {useImageSettings} from './ImageSettingsProvider';
import type {ImageSetting} from '@/lib/image-settings';

// Framing scales the complete image, allowing the editor to zoom back out without
// losing pixels to an earlier object-fit crop. The supplied original stays intact.
export default function ArtworkImage({src:original,alt,fit='contain',className='',imageKey,framing,loading='lazy'}:{
 src:string;alt:string;fit?:'contain'|'cover';className?:string;imageKey?:string;framing?:ImageSetting;loading?:'lazy'|'eager';
}){
 const images=useImageSettings();
 const view=framing||(imageKey?images[imageKey]:undefined)||images['asset:'+original];
 const src=view?.src||original;
 const crop=artworkCrops[src];
 const holder=useRef<HTMLSpanElement>(null);
 const native=useRef<HTMLImageElement>(null);
 const [frameRatio,setFrameRatio]=useState(1);
 const [imageRatio,setImageRatio]=useState(1);
 useEffect(()=>{
  const element=holder.current;if(!element)return;
  const update=()=>{if(element.clientWidth&&element.clientHeight)setFrameRatio(element.clientWidth/element.clientHeight)};
  update();const observer=new ResizeObserver(update);observer.observe(element);return()=>observer.disconnect();
 },[]);
 useEffect(()=>{if(native.current?.naturalWidth)setImageRatio(native.current.naturalWidth/native.current.naturalHeight)},[src]);
 const ratio=crop?crop.width/crop.height:imageRatio;
 const actualFit=view?.fit||fit;
 const scale=(view?.zoom??1)*(actualFit==='cover'?Math.max(ratio/frameRatio,frameRatio/ratio):1);
 const width=ratio>=frameRatio?100:ratio/frameRatio*100;
 const height=ratio<=frameRatio?100:frameRatio/ratio*100;
 const x=((view?.positionX??50)-50)/100*(100-width*scale);
 const y=((view?.positionY??50)-50)/100*(100-height*scale);
 return <span ref={holder} className={'managed-image '+className} data-image-key={imageKey} data-image-zoom={view?.zoom??1}>
  <span className="managed-image-layer" style={{transform:'translate('+x+'%, '+y+'%) scale('+scale+')'}}>
   {crop?<svg className="artwork-visual" role={alt?'img':undefined} aria-label={alt||undefined} aria-hidden={alt?undefined:true} viewBox={'0 0 '+crop.width+' '+crop.height} preserveAspectRatio="xMidYMid meet">
    <svg x="0" y="0" width={crop.width} height={crop.height} overflow="hidden"><image href={src} x={-crop.x} y={-crop.y} width={crop.sourceWidth} height={crop.sourceHeight}/></svg>
   </svg>:<img ref={native} className="artwork-visual" src={src} alt={alt} loading={loading} onLoad={e=>setImageRatio(e.currentTarget.naturalWidth/e.currentTarget.naturalHeight)} style={{objectFit:'contain'}}/>}
  </span>
 </span>
}
