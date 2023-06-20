import type { NextPage } from "next";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.hero}>
          <div className={styles.heroBackground}>
            <div className={styles.heroBackgroundInner}>
              <Image
                src="/hero-gradient.png"
                width={1390}
                height={1390}
                alt="Background gradient from red to blue"
                quality={100}
                className={styles.gradient}
              />
            </div>
          </div>
          <div className={styles.heroBodyContainer}>
            <div className={styles.heroBody}>
              <h1 className={styles.heroTitle}>
                <span className={styles.heroTitleGradient}>Welcome 👋</span>
                <br />
                HyperRental
              </h1>
              <p className={styles.heroSubtitle}>
                <Link
                  className={styles.link}
                  href="https://github.com/bibitto/Hyper-Rental"
                  target="_blank"
                >
                  HyperRental
                </Link>{" "}
                is a peer-to-peer collateral-free rental protocol which
                utilizing token bound account to enable true ownership of rented
                assets and rental of all token standards.
              </p>

              <div className={styles.heroCtaContainer}>
                <Link className={styles.heroCta} href="/rent">
                  Get Started
                </Link>
                <Link
                  className={styles.secondaryCta}
                  href="https://github.com/bibitto/HyperRental-contract"
                  target="_blank"
                >
                  GitHub
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
