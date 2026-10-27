import { Config } from '@remotion/cli/config';

// 이 작업 환경에 미리 깔린 크롬으로 렌더링한다. 다른 컴퓨터에서는 이 줄을 지워도 된다(자동 다운로드).
const LOCAL_CHROME = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
import { existsSync } from 'node:fs';
if (existsSync(LOCAL_CHROME)) Config.setBrowserExecutable(LOCAL_CHROME);

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setConcurrency(4);
