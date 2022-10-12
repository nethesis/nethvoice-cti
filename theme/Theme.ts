const theme = {
  button: {
    base: 'flex content-center items-center justify-center font-medium tracking-wide transition-colors duration-200 transform focus:outline-none focus:ring-2 gap-2 focus:z-20',
    primary:
      'focus:ring-indigo-500 bg-indigo-600 hover:bg-indigo-700 text-white border border-transparent focus:ring-offset-2',
    secondary:
      'focus:ring-indigo-500 bg-indigo-200 hover:bg-indigo-300 text-indigo-600 border border-transparent focus:ring-offset-2',
    light:
      'border border-gray-300 focus:ring-indigo-500 bg-white hover:bg-gray-100 text-gray-700 focus:ring-offset-2',
    danger:
      'focus:ring-red-500 bg-red-600 hover:bg-red-700 text-white border border-transparent focus:ring-offset-2',
    transparent:
      'focus:ring-indigo-500 ring-inset focus:outline-none hover:bg-gray-100 text-gray-700 border border-transparent drop-shadow-none',
    rounded: {
      base: 'rounded-md',
      large: 'rounded-lg',
      extra: 'rounded-xl',
      full: 'rounded-full',
      none: 'rounded-none',
    },
    squared: {
      right: 'rounded-tr-none rounded-br-none',
      top: 'rounded-tr-none rounded-tl-none',
      left: 'rounded-tl-none rounded-bl-none',
      bottom: 'rounded-bl-none rounded-br-none',
      tright: 'rounded-tr-none rounded-tl-none rounded-br-none',
      tleft: 'rounded-tl-none rounded-tr-none rounded-bl-none',
    },
    sizes: {
      base: 'px-3.5 py-2',
      large: 'px-4 py-2.5',
      full: 'w-full h-full',
    },
  },
  switch: {
    background: 'relative inline-flex h-6 w-11 items-center rounded-full',
    circle:
      'inline-block h-4 w-4 transform rounded-full bg-white transition ease-in-out duration-200',
    on: {
      translate: 'translate-x-6',
      gray: 'bg-gray-300',
      indigo: 'bg-indigo-600',
    },
    off: {
      translate: 'translate-x-1',
      gray: 'bg-gray-200',
      indigo: 'bg-indigo-200',
    },
  },
  input: {
    base: 'block w-full relative placeholder-gray-500 text-gray-900  bg-white focus:z-10',
    label: 'text-sm font-medium text-gray-700',
    helper: 'mt-2 text-sm text-gray-700 text-red-600',
    size: {
      base: 'px-3 py-2 sm:text-sm',
      large: 'px-4 py-3 sm:text-md',
    },
    colors: {
      gray: 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 placeholder:text-gray-400',
      error:
        'border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500 placeholder-red-700',
    },
    icon: {
      base: 'absolute flex items-center z-20',
      gray: 'text-gray-500',
      red: 'text-red-600',
      left: 'inset-y-0 left-0 pl-3',
      right: 'inset-y-0 right-0 pr-3',
      size: {
        base: 'h-5 w-5',
        large: 'h-6 w-6',
      },
    },
    rounded: {
      base: 'rounded-md',
      full: 'rounded-full',
    },
    squared: {
      right: 'rounded-tr-none rounded-br-none',
      top: 'rounded-tr-none rounded-tl-none',
      left: 'rounded-tl-none rounded-bl-none',
      bottom: 'rounded-bl-none rounded-br-none',
    },
  },
  modal: {
    panel: {
      base: 'relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg',
      transition: {
        enter: 'ease-out duration-300',
        enterFrom: 'opacity-0',
        enterTo: 'opacity-100',
        leave: 'ease-in duration-200',
        leaveFrom: 'opacity-100',
        leaveTo: 'opacity-0',
      },
    },
    content: 'bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 sm:flex sm:items-start',
    background: {
      base: 'fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity',
      transition: {
        enter: 'ease-out duration-300',
        enterFrom: 'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95',
        enterTo: 'opacity-100 translate-y-0 sm:scale-100',
        leave: 'ease-in duration-200',
        leaveFrom: 'opacity-100 translate-y-0 sm:scale-100',
        leaveTo: 'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95',
      },
    },
    actions:
      'bg-gray-50 px-4 py-3 flex flex-col sm:flex-row-reverse  sm:px-6 gap-3',
    sizes: {
      base: '',
      large: '',
    },
  },
  status: {
    available: {
      badge: {
        base: 'bg-green-100 text-green-900',
        dot: 'bg-green-700',
      },
      avatar: {
        dot: 'bg-green-500',
      },
      card: {
        border: 'border-green-500'
      }
    },
    dnd: {
      badge: {
        base: 'bg-gray-100 text-gray-900',
        dot: 'bg-gray-700',
      },
      avatar: {
        dot: 'bg-gray-900',
      },
      card: {
        border: 'border-gray-500'
      }
    },
    voicemail: {
      badge: {
        base: 'bg-orange-100 text-orange-900',
        dot: 'bg-orange-700',
      },
      avatar: {
        dot: 'bg-orange-500',
      },
      card: {
        border: 'border-orange-500'
      }
    },
    cellphone: {
      badge: {
        base: 'bg-purple-100 text-purple-900',
        dot: 'bg-purple-700',
      },
      avatar: {
        dot: 'bg-purple-500',
      },
      card: {
        border: 'border-purple-500'
      }
    },
    callforward: {
      badge: {
        base: 'bg-yellow-100 text-yellow-900',
        dot: 'bg-yellow-700',
      },
      avatar: {
        dot: 'bg-yellow-500',
      },
      card: {
        border: 'border-yellow-500'
      }
    },
    busy: {
      badge: {
        base: 'bg-red-100 text-red-900',
        dot: 'bg-red-700',
      },
      avatar: {
        dot: 'bg-red-500',
      },
      card: {
        border: 'border-red-500'
      }
    },
    incoming: {
      badge: {
        base: 'bg-blue-100 text-blue-900',
        dot: 'bg-blue-700',
      },
      avatar: {
        dot: 'bg-blue-500',
      },
      card: {
        border: 'border-blue-500'
      }
    },
    offline: {
      badge: {
        base: 'bg-gray-100 text-gray-600',
        dot: 'bg-gray-500',
      },
      avatar: {
        dot: 'bg-gray-500',
      },
      card: {
        border: 'border-gray-500'
      }
    },
  },
  badge: {
    base: 'font-medium mr-2 flex justify-center items-center w-fit gap-2',
    dot: 'w-1.5 h-1.5 rounded-full',
    rounded: {
      base: 'rounded-md',
      full: 'rounded-full',
    },
    sizes: {
      base: 'px-2.5 py-0.5 text-sm',
      large: 'px-2.5 py-0.5 text-base',
    },
  },
  avatar: {
    base: 'h-12 w-12 relative',
    group: 'flex -space-x-4 w-fit',
    reverse: 'flex-row-reverse space-x-reverse',
    image: 'w-full h-full',
    bordered: 'border-2 border-white',
    initials: {
      base: 'text-white w-full h-full flex justify-center items-center text-xl',
      background: 'bg-gray-500',
    },
    placeholder: {
      base: '',
      background: 'bg-gray-100',
    },
    status: {
      base: 'w-4 h-4 rounded-full absolute border-2 border-white',
      circular: '-right-1 top-9',
      rounded: '-right-2 top-10',
    },
    rounded: {
      base: 'rounded-md',
      full: 'rounded-full',
    },
  },
  dropdown: {
    base: 'relative inline-block text-left',
    size: {
      full: 'w-full h-full'
    },
    item: {
      base: 'block px-4 py-2 text-sm flex items-center gap-3 mt-1 mb-1',
      light: 'text-gray-700',
      active: 'bg-gray-100 text-gray-900',
      icon: 'h-5 w-5 text-gray-400 flex',
      centered: 'justify-center'
    },
    items: {
      base: 'absolute z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
      position: {
        right: 'left-0',
        left: 'right-0',
      },
      divider: 'divide-y divide-gray-100',
      header: 'block px-4 py-3 text-sm',
      transition: {
        enter: 'transition ease-out duration-100',
        enterFrom: 'transform opacity-0 scale-95',
        enterTo: 'transform opacity-100 scale-100',
        leave: 'transition ease-in duration-75',
        leaveFrom: 'transform opacity-100 scale-100',
        leaveTo: 'transform opacity-0 scale-95',
      },
    },
  },
  card: {
    base: 'block max-w-md bg-white rounded-lg border border-gray-200 shadow dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700',
    wrapper: {
      border: 'border-t-2',
      rounded: 'rounded-lg'
    },
    header: {
      base: 'flex justify-between p-7'
    },
    content: {
      base: 'flex flex-col p-7 gap-1 border-t border-gray-200'
    },
    actions: {
      base: 'grid grid-cols-2 divide-x divider-gray-200 h-14 border-t border-gray-200 z-30 rounded-b-xl'
    }
  }
};

export default theme;
