import { generateRandomRange,  } from '@teselagen/range-utils';
import styles from './zoink.module.css';
import { times } from 'lodash';
import { BounceLoader } from '@teselagen/bounce-loader';

export function Zoink() {
  const a = generateRandomRange();
  console.info(a);
  times(10, () => {
    console.info(generateRandomRange())
  })
  return (
    <div className={styles['container']}>
      <BounceLoader></BounceLoader>
      yoyo
      <h1>Welcome to Zoink!</h1>
    </div>
  );
}

export default Zoink;
