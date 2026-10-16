import type {Episode} from '../types';
import {ep01} from './ep01';
import {ep02} from './ep02';

// كل حلقة جديدة: انسخ ep01.ts لـ epNN.ts، عدّل الأخبار والصور، وأضفها هنا
export const episodes: Episode[] = [ep01, ep02];
