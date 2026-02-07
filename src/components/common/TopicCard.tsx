import { makeStyles, tokens, Card, Text } from '@fluentui/react-components';
import { ArrowRight24Regular } from '@fluentui/react-icons';
import { useNavigate } from 'react-router-dom';

interface TopicCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color?: string;
}

const useStyles = makeStyles({
  card: {
    padding: tokens.spacingHorizontalL,
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: tokens.shadow16,
    },
  },
  iconContainer: {
    width: '56px',
    height: '56px',
    borderRadius: tokens.borderRadiusMedium,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacingVerticalM,
    fontSize: '28px',
  },
  title: {
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: tokens.spacingVerticalS,
    color: tokens.colorNeutralForeground1,
  },
  description: {
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase300,
    lineHeight: '1.5',
    flex: 1,
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    marginTop: tokens.spacingVerticalM,
    color: '#0d5c63',
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
  },
});

const TopicCard = ({ title, description, icon, path, color = '#0d5c63' }: TopicCardProps) => {
  const styles = useStyles();
  const navigate = useNavigate();

  return (
    <Card className={styles.card} onClick={() => navigate(path)}>
      <div
        className={styles.iconContainer}
        style={{ backgroundColor: `${color}15`, color }}
      >
        {icon}
      </div>
      <Text className={styles.title} size={500}>
        {title}
      </Text>
      <Text className={styles.description}>{description}</Text>
      <div className={styles.link}>
        Learn more <ArrowRight24Regular />
      </div>
    </Card>
  );
};

export default TopicCard;
