// 键盘快捷键帮助面板
interface KeyboardHelpPanelProps {
  onClose: () => void;
}

export function KeyboardHelpPanel({ onClose }: KeyboardHelpPanelProps) {
  const shortcuts = [
    { key: 'Space', action: 'Play / Pause', category: 'Control' },
    { key: 'R', action: 'Reset maze and algorithm', category: 'Control' },
    { key: 'S', action: 'Single step (next generation)', category: 'Control' },
    { key: 'E', action: 'Export JSON data', category: 'Data' },
    { key: 'H', action: 'Show/Hide this help panel', category: 'UI' },
    { key: 'F', action: 'Toggle fullscreen', category: 'UI' },
    { key: 'Esc', action: 'Close dialogs', category: 'UI' },
    { key: '1-9', action: 'Set animation speed (1=slow, 9=fast)', category: 'Control' },
  ];

  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.8)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(5px)'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--nord1)',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '600px',
          width: '90%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          border: '1px solid var(--nord3)'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            color: 'var(--nord8)',
            fontWeight: 600
          }}>
            ⌨️ Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--nord4)',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '5px 10px'
            }}
          >
            ✕
          </button>
        </div>

        {categories.map(category => (
          <div key={category} style={{ marginBottom: '20px' }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--nord13)',
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {category}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {shortcuts
                .filter(s => s.category === category)
                .map((shortcut, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: 'var(--nord0)',
                      borderRadius: '6px'
                    }}
                  >
                    <span style={{
                      fontSize: '13px',
                      color: 'var(--nord5)'
                    }}>
                      {shortcut.action}
                    </span>
                    <kbd style={{
                      background: 'var(--nord3)',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--nord8)',
                      fontFamily: 'monospace',
                      border: '1px solid var(--nord2)',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                    }}>
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
            </div>
          </div>
        ))}

        <div style={{
          marginTop: '25px',
          padding: '15px',
          background: 'var(--nord0)',
          borderRadius: '6px',
          borderLeft: '3px solid var(--nord10)',
          fontSize: '12px',
          color: 'var(--nord4)'
        }}>
          <div style={{ fontWeight: 600, marginBottom: '5px', color: 'var(--nord10)' }}>
            💡 Tip
          </div>
          Keyboard shortcuts work when you're not typing in input fields.
          Press <kbd style={{
            background: 'var(--nord3)',
            padding: '2px 6px',
            borderRadius: '3px',
            fontFamily: 'monospace'
          }}>H</kbd> anytime to toggle this panel.
        </div>
      </div>
    </div>
  );
}

