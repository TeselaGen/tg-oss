import { Uploader } from '@teselagen/uploader';
import { BounceLoader } from '@teselagen/bounce-loader';
import { Zoink } from './zoink/zoink';

import './ui.css';

export function Ui() {
  return (
    <div a="wee">
      <h1>Wee thomas to Ui!</h1>
      <Uploader />
      <BounceLoader></BounceLoader>
      <Zoink />
    </div>
  );
}

export default Ui;
