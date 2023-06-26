import { generateRandomRange,  } from '@teselagen/range-utils';
import styles from './zoink.module.css';

export function Zoink() {
  const a = generateRandomRange();
  console.info(a);
  return (
    <div className={styles['container']}>
      yoyo
      <h1>Welcome to Zoink!</h1>
    </div>
  );
}

export default Zoink;
