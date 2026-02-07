export const adaptiveCardsHostConfig = {
  hostCapabilities: {
    capabilities: null
  },
  choiceSetInputValueSeparator: ',',
  supportsInteractivity: true,
  fontFamily: '"Segoe UI", "GDS Transport", Arial, sans-serif',
  spacing: {
    small: 8,
    default: 12,
    medium: 16,
    large: 20,
    extraLarge: 24,
    padding: 16
  },
  separator: {
    lineThickness: 1,
    lineColor: '#e0e0e0'
  },
  fontSizes: {
    small: 12,
    default: 14,
    medium: 16,
    large: 18,
    extraLarge: 22
  },
  fontWeights: {
    lighter: 200,
    default: 400,
    bolder: 600
  },
  imageSizes: {
    small: 40,
    medium: 80,
    large: 160
  },
  containerStyles: {
    default: {
      backgroundColor: '#ffffff',
      foregroundColors: {
        default: {
          default: '#0b0c0c',
          subtle: '#505a5f'
        },
        accent: {
          default: '#0d5c63',
          subtle: '#0a4045'
        },
        attention: {
          default: '#d4351c',
          subtle: '#b02a17'
        },
        good: {
          default: '#00703c',
          subtle: '#005a30'
        },
        warning: {
          default: '#f47738',
          subtle: '#c35e2d'
        }
      }
    },
    emphasis: {
      backgroundColor: '#f3f4f5',
      foregroundColors: {
        default: {
          default: '#0b0c0c',
          subtle: '#505a5f'
        },
        accent: {
          default: '#0d5c63',
          subtle: '#0a4045'
        },
        attention: {
          default: '#d4351c',
          subtle: '#b02a17'
        },
        good: {
          default: '#00703c',
          subtle: '#005a30'
        },
        warning: {
          default: '#f47738',
          subtle: '#c35e2d'
        }
      }
    },
    accent: {
      backgroundColor: '#e8f4fd',
      foregroundColors: {
        default: {
          default: '#0b0c0c',
          subtle: '#505a5f'
        },
        accent: {
          default: '#0d5c63',
          subtle: '#0a4045'
        }
      }
    },
    good: {
      backgroundColor: '#e6f4ea',
      foregroundColors: {
        default: {
          default: '#0b0c0c',
          subtle: '#505a5f'
        },
        accent: {
          default: '#00703c',
          subtle: '#005a30'
        }
      }
    },
    attention: {
      backgroundColor: '#fef2f2',
      foregroundColors: {
        default: {
          default: '#0b0c0c',
          subtle: '#505a5f'
        },
        accent: {
          default: '#d4351c',
          subtle: '#b02a17'
        }
      }
    },
    warning: {
      backgroundColor: '#fff7e6',
      foregroundColors: {
        default: {
          default: '#0b0c0c',
          subtle: '#505a5f'
        },
        accent: {
          default: '#f47738',
          subtle: '#c35e2d'
        }
      }
    }
  },
  actions: {
    maxActions: 5,
    spacing: 'default',
    buttonSpacing: 8,
    showCard: {
      actionMode: 'inline',
      inlineTopMargin: 16
    },
    actionsOrientation: 'horizontal',
    actionAlignment: 'stretch'
  },
  adaptiveCard: {
    allowCustomStyle: true
  }
};