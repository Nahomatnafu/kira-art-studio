"use client";
import ArtworkImage from './ArtworkImage';
import {defaultFraming,type ImageSetting} from '@/lib/image-settings';
import {Upload} from 'lucide-react';
export default function ImageEditor({label,value,onChange,upload,uploading=false,aspect=1.5,logos=false,library=[]}:{
 label:string;value:ImageSetting;onChange:(v:ImageSetting)=>void;upload:(file:File,set:(url:string)=>void)=>void;uploading?:boolean;aspect?:number;logos?:boolean;library?:{src:string;label:string}[];
}){
 return <article className="image-editor-card">
  <h3>{label}</h3>
  <div className="image-framing-preview" style={{aspectRatio:aspect,maxWidth:420*aspect,marginInline:"auto"}}>{value.src?<ArtworkImage src={value.src} alt={label+' preview'} framing={value}/>:<span>No photo selected</span>}</div>
  <label>Image URL<input value={value.src} maxLength={2000} onChange={e=>onChange({...value,src:e.target.value})}/></label>
  <div className="image-editor-actions">
   <label className="button button-outline upload-button"><Upload size={16}/>{uploading?'Uploading…':(logos?'Replace logo':'Replace image')}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={e=>{const file=e.target.files?.[0];if(file)upload(file,url=>onChange({...value,src:url}));e.target.value=''}}/></label>
   {!logos&&library.length>0&&<label>Choose an existing photo<select value="" onChange={e=>{if(e.target.value)onChange({...value,src:e.target.value})}}><option value="">Photo library…</option>{library.map(x=><option key={x.src} value={x.src}>{x.label}</option>)}</select></label>}
  </div>
  {!logos&&<fieldset className="image-framing-controls"><legend>Image framing</legend>
   <label>Fit<select value={value.fit} onChange={e=>onChange({...value,fit:e.target.value as ImageSetting['fit']})}><option value="contain">Show full image</option><option value="cover">Fill frame</option></select></label>
   <label>Zoom <output>{Math.round(value.zoom*100)}%</output><input aria-label={label+' zoom'} type="range" min="0.5" max="3" step="0.05" value={value.zoom} onChange={e=>onChange({...value,zoom:Number(e.target.value)})}/></label>
   <label>Horizontal position <output>{value.positionX}%</output><input aria-label={label+' horizontal position'} type="range" min="0" max="100" value={value.positionX} onChange={e=>onChange({...value,positionX:Number(e.target.value)})}/></label>
   <label>Vertical position <output>{value.positionY}%</output><input aria-label={label+' vertical position'} type="range" min="0" max="100" value={value.positionY} onChange={e=>onChange({...value,positionY:Number(e.target.value)})}/></label>
   <button className="text-link" type="button" onClick={()=>onChange({...value,...defaultFraming})}>Reset framing</button>
  </fieldset>}
 </article>
}
