import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// الخط محفوظ محلياً عشان الرندر ما يعتمد على الإنترنت
export const fontFamily = 'Cairo';
loadFont({family: fontFamily, url: staticFile('fonts/Cairo.ttf'), weight: '200 1000'});
