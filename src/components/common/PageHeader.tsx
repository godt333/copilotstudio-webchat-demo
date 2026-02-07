import { makeStyles, tokens, Text, Breadcrumb, BreadcrumbItem, BreadcrumbDivider, BreadcrumbButton } from '@fluentui/react-components';
import { Home24Regular } from '@fluentui/react-icons';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; path?: string }[];
}

const useStyles = makeStyles({
  container: {
    backgroundColor: '#0d5c63',
    color: 'white',
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalXXL}`,
  },
  inner: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  breadcrumbs: {
    marginBottom: tokens.spacingVerticalM,
  },
  breadcrumbItem: {
    color: '#ffffffcc',
    ':hover': {
      color: 'white',
    },
  },
  title: {
    fontWeight: tokens.fontWeightBold,
    marginBottom: tokens.spacingVerticalS,
    color: 'white',
  },
  description: {
    fontSize: tokens.fontSizeBase400,
    color: '#ffffffcc',
    maxWidth: '700px',
    lineHeight: '1.6',
  },
});

const PageHeader = ({ title, description, breadcrumbs = [] }: PageHeaderProps) => {
  const styles = useStyles();
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        {breadcrumbs.length > 0 && (
          <Breadcrumb className={styles.breadcrumbs} size="small">
            <BreadcrumbItem>
              <BreadcrumbButton
                icon={<Home24Regular />}
                onClick={() => navigate('/')}
                className={styles.breadcrumbItem}
              >
                Home
              </BreadcrumbButton>
            </BreadcrumbItem>
            {breadcrumbs.map((crumb, index) => (
              <span key={index} style={{ display: 'contents' }}>
                <BreadcrumbDivider />
                <BreadcrumbItem>
                  {crumb.path ? (
                    <BreadcrumbButton
                      onClick={() => navigate(crumb.path!)}
                      className={styles.breadcrumbItem}
                    >
                      {crumb.label}
                    </BreadcrumbButton>
                  ) : (
                    <BreadcrumbButton current className={styles.breadcrumbItem}>
                      {crumb.label}
                    </BreadcrumbButton>
                  )}
                </BreadcrumbItem>
              </span>
            ))}
          </Breadcrumb>
        )}
        <Text as="h1" size={800} className={styles.title} block>
          {title}
        </Text>
        {description && (
          <Text className={styles.description} block>
            {description}
          </Text>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
