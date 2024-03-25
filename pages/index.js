import Head from 'next/head';
import styles from '../styles/Home.module.css';

import Sankey from "../components/sankey";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Electoral Bonds Data: Dashboard</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

        <Sankey />

    </div>
  );
}
