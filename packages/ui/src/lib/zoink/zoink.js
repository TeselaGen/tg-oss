import { generateRandomRange,  } from '@teselagen/range-utils';
import styles from './zoink.module.css';
import { times } from 'lodash';

export function Zoink() {
  const a = generateRandomRange();
  console.info(a);
  times(10, () => {
    console.info(generateRandomRange())
  })
  return (
    <div className={styles['container']}>
      yoyo
      <h1>Welcome to Zoink!</h1>
    </div>
  );
}

export default Zoink;
