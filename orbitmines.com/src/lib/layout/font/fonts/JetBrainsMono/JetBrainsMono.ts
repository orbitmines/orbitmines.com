import {FontFamily} from "../../Font";

import JetBrainsMonoRegular from './ttf/JetBrainsMono-Regular.ttf';
import JetBrainsMonoSemiBold from './ttf/JetBrainsMono-SemiBold.ttf';
import JetBrainsMonoBold from './ttf/JetBrainsMono-Bold.ttf';

const JetBrainsMono: FontFamily = {
  family: 'JetBrainsMono, monospace',
  fonts: [
    {src: JetBrainsMonoRegular, fontWeight: 'normal', fontStyle: 'normal'},
    {src: JetBrainsMonoSemiBold, fontWeight: 'semibold', fontStyle: 'normal'},
    {src: JetBrainsMonoBold, fontWeight: 'bold', fontStyle: 'normal'},
  ]
}

export default JetBrainsMono;