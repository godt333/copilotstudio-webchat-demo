import { makeStyles, tokens, Card, Text, Link } from '@fluentui/react-components';
import { ArrowRight16Regular } from '@fluentui/react-icons';

interface InfoCardProps {
  title: string;
  items: { label: string; href?: string }[];
  variant?: 'default' | 'warning' | 'info';
}

const useStyles = makeStyles({
  card: {
    padding: tokens.spacingHorizontalL,
    height: '100%',
  },
  warningCard: {
    borderLeft: '4px solid #d4351c',
  },
  infoCard: {
    borderLeft: '4px solid #0d5c63',
  },
  title: {
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: tokens.spacingVerticalM,
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  link: {
    color: '#0d5c63',
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline',
    },
  },
});

const InfoCard = ({ title, items, variant = 'default' }: InfoCardProps) => {
  const styles = useStyles();

  const cardClassName = `${styles.card} ${
    variant === 'warning' ? styles.warningCard : variant === 'info' ? styles.infoCard : ''
  }`;

  return (
    <Card className={cardClassName}>
      <Text className={styles.title} size={400}>
        {title}
      </Text>
      <ul className={styles.list}>
        {items.map((item, index) => (
          <li key={index} className={styles.listItem}>
            <ArrowRight16Regular />
            {item.href ? (
              <Link href={item.href} className={styles.link}>
                {item.label}
              </Link>
            ) : (
              <Text>{item.label}</Text>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default InfoCard;
