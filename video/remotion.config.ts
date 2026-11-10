import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setCodec('h264');
Config.setCrf(18);
Config.setPixelFormat('yuv420p');

// In sandboxed/cloud environments a preinstalled Chromium can be used instead
// of Remotion downloading its own: REMOTION_BROWSER=/path/to/chrome-headless-shell
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
