import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import {nitro} from 'nitro/vite';
import {workflow} from 'workflow/vite';
import vercelConfig from './vercel.json' with {type:'json'};
process.env.RAYON_NUM_THREADS ??= '1';
const headers=Object.fromEntries(vercelConfig.headers[0].headers.map(header=>[header.key,header.value]));
export default defineConfig({plugins:[react(),nitro(),workflow()],nitro:{serverDir:'./server',routeRules:{'/**':{headers}}}});
