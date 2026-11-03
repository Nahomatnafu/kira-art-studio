"use client";
import {createContext,useContext} from 'react';
import type {ImageSettings} from '@/lib/image-settings';
const ImageContext=createContext<ImageSettings>({});
export function ImageSettingsProvider({images,children}:{images:ImageSettings;children:React.ReactNode}){return <ImageContext.Provider value={images}>{children}</ImageContext.Provider>}
export const useImageSettings=()=>useContext(ImageContext);
