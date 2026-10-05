import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// الخط محفوظ محلياً عشان الرندر ما يعتمد على الإنترنت
export const fontFamily = 'Cairo';
loadFont({family: fontFamily, url: staticFile('fonts/Cairo.ttf'), weight: '200 1000'});

// خط سيريف للأرقام الإنجليزية في العداد (نفس طابع الفيديو المرجعي)
export const numberFamily = 'Playfair Display';
loadFont({family: numberFamily, url: staticFile('fonts/PlayfairDisplay.ttf'), weight: '400 900'});
