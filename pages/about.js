import Head from 'next/head';
import styles from '../styles/Home.module.css';

import { Box, Container } from '@mui/material';

export default function About() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Electoral Bonds Data: About</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box>
        <Container>
          <img style={{maxWidth: "100%"}} src="https://www.researchgate.net/profile/Assa-Doron-2/publication/308130259/figure/fig2/AS:566641744646144@1512109327307/Adarsh-Balak-untitled-undated-Reproduced-with-kind-permission-of-Priyesh-Trivedi.png" />
        </Container>
      </Box>

    </div>
  );
}
