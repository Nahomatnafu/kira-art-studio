export type ImageSetting={src:string;zoom:number;positionX:number;positionY:number;fit:'contain'|'cover'};
export type ImageSettings=Record<string,ImageSetting>;
export const defaultFraming={zoom:1,positionX:50,positionY:50,fit:'contain' as const};
export const galleryImageKey=(group:string,index:number)=>group+'.photo.'+index;

export const studioLogo = "/images/kira-mark.webp";
