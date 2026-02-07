/**
 * CodeModal Component
 * 
 * A reusable modal dialog for displaying code in fullscreen view.
 * Includes copy functionality and syntax highlighting preservation.
 */
import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  Button,
  makeStyles,
  shorthands,
  Text,
  Tooltip,
} from '@fluentui/react-components';
import {
  Dismiss24Regular,
  Copy24Regular,
  Checkmark24Regular,
  FullScreenMaximize24Regular,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  expandButton: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#d4d4d4',
    minWidth: 'auto',
    ...shorthands.padding('6px'),
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      color: '#ffffff',
    },
  },
  codeBlockWrapper: {
    position: 'relative',
  },
  dialogSurface: {
    maxWidth: '90vw',
    width: '1200px',
    maxHeight: '90vh',
    ...shorthands.padding('0'),
  },
  dialogHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shorthands.padding('16px', '24px'),
    backgroundColor: '#252526',
    borderBottom: '1px solid #3c3c3c',
  },
  dialogTitle: {
    color: '#cccccc',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  dialogActions: {
    display: 'flex',
    gap: '8px',
  },
  actionButton: {
    backgroundColor: 'transparent',
    color: '#cccccc',
    minWidth: 'auto',
    ...shorthands.padding('6px', '12px'),
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#ffffff',
    },
  },
  closeButton: {
    backgroundColor: 'transparent',
    color: '#cccccc',
    minWidth: 'auto',
    ...shorthands.padding('6px'),
    ':hover': {
      backgroundColor: '#e81123',
      color: '#ffffff',
    },
  },
  dialogContent: {
    ...shorthands.padding('0'),
    backgroundColor: '#1e1e1e',
    ...shorthands.overflow('auto'),
    maxHeight: 'calc(90vh - 60px)',
  },
  codeContent: {
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    ...shorthands.padding('24px'),
    fontFamily: "'Cascadia Code', 'Fira Code', Consolas, Monaco, monospace",
    fontSize: '14px',
    lineHeight: '1.6',
    whiteSpace: 'pre',
    ...shorthands.margin('0'),
    minHeight: '100%',
  },
  languageBadge: {
    backgroundColor: '#0078d4',
    color: 'white',
    ...shorthands.padding('2px', '8px'),
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

interface CodeModalProps {
  code: string;
  title?: string;
  language?: string;
  children: React.ReactNode;
}

export function CodeBlockWithModal({ code, title = 'Code', language = 'tsx', children }: CodeModalProps) {
  const styles = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [code]);

  return (
    <>
      <div className={styles.codeBlockWrapper}>
        {children}
        <Tooltip content="View fullscreen" relationship="label">
          <Button
            className={styles.expandButton}
            appearance="subtle"
            icon={<FullScreenMaximize24Regular />}
            onClick={() => setIsOpen(true)}
          />
        </Tooltip>
      </div>

      <Dialog open={isOpen} onOpenChange={(_, data) => setIsOpen(data.open)}>
        <DialogSurface className={styles.dialogSurface}>
          <DialogBody style={{ padding: 0 }}>
            <div className={styles.dialogHeader}>
              <DialogTitle className={styles.dialogTitle}>
                <span className={styles.languageBadge}>{language}</span>
                <Text weight="semibold" style={{ color: '#cccccc' }}>{title}</Text>
              </DialogTitle>
              <div className={styles.dialogActions}>
                <Tooltip content={copied ? 'Copied!' : 'Copy code'} relationship="label">
                  <Button
                    className={styles.actionButton}
                    appearance="subtle"
                    icon={copied ? <Checkmark24Regular /> : <Copy24Regular />}
                    onClick={handleCopy}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </Tooltip>
                <Tooltip content="Close" relationship="label">
                  <Button
                    className={styles.closeButton}
                    appearance="subtle"
                    icon={<Dismiss24Regular />}
                    onClick={() => setIsOpen(false)}
                  />
                </Tooltip>
              </div>
            </div>
            <DialogContent className={styles.dialogContent}>
              <pre className={styles.codeContent}>{code}</pre>
            </DialogContent>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
}

export default CodeBlockWithModal;
