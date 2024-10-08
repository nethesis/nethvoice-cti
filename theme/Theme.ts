// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

const theme = {
  button: {
    base: 'inline-flex content-center items-center justify-center font-medium tracking-wide transition-colors duration-200 transform focus:outline-none focus:z-20 disabled:cursor-not-allowed',
    primary:
      'border border-transparent bg-primary dark:bg-primaryDark text-white dark:text-primaryButtonTextDark hover:bg-primaryHover dark:hover:bg-primaryDarkHover focus:ring-2 focus:ring-primaryRing dark:focus:ring-primaryRingDark ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900',
    secondary:
      'border border-transparent focus:ring-primaryLight bg-primaryLighter text-primaryDark hover:bg-primaryLighter dark:focus:ring-primaryDark dark:bg-primaryDarker dark:text-primaryLight dark:hover:bg-primaryDarker focus:ring-2 focus:ring-offset-2',
    white:
      'border shadow-sm border-gray-300 dark:border-gray-500 bg-transparent dark:bg-transparent text-primary dark:text-primaryDark hover:bg-gray-200 hover:bg-opacity-30 dark:hover:bg-gray-600 dark:hover:bg-opacity-30 focus:ring-primaryLight dark:focus:ring-primaryDark focus:ring-2 focus:ring-offset-2',
    ghost:
      'border-gray-300 text-primary dark:text-primaryDark  hover:bg-gray-200 hover:bg-opacity-30 dark:hover:bg-gray-600 dark:hover:bg-opacity-30  focus:ring-primaryLight dark:border-gray-600 dark:focus:ring-primaryDark',
    dashboard:
      'border-gray-300 text-primary dark:text-primaryDark hover:bg-gray-200 dark:border-gray-600  dark:hover:bg-gray-700 dark:hover:disabled:bg-transparent hover:disabled:bg-transparent dark:focus:ring-primaryDark',
    danger:
      'border border-transparent focus:ring-rose-500 bg-rose-600 hover:bg-rose-700 text-white dark:focus:ring-rose-600 dark:bg-rose-700 dark:hover:bg-rose-800 dark:text-white focus:ring-2 focus:ring-offset-2',
    rounded: {
      small: 'rounded',
      base: 'rounded-md',
    },
    sizes: {
      small: 'px-2.5 py-1.5 text-xs',
      base: 'px-3 py-2 text-sm leading-4',
      large: 'px-4 py-2 text-sm',
      full_h: 'h-full',
      full_w: 'w-full',
    },
  },
  switch: {
    background:
      'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primaryLight dark:focus:ring-primaryDark',
    circle:
      'pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out bg-white dark:bg-gray-200',
    on: {
      translate: 'translate-x-5',
      gray: 'bg-gray-400 dark:bg-gray-500',
      primary: 'bg-primary dark:bg-primary',
    },
    off: {
      translate: 'translate-x-0',
      gray: 'bg-gray-200 dark:bg-gray-600 cursor-not-allowed',
      primary: 'bg-primaryLighter dark:bg-primaryDarker cursor-not-allowed',
    },
  },
  iconSwitch: {
    base: 'transition-colors duration-200 transform focus:outline-none focus:ring-2 focus:z-20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-block cursor-pointer rounded-md text-gray-700 hover:bg-gray-200 focus:ring-primaryLight dark:text-gray-100 dark:hover:bg-gray-900 dark:focus:ring-primaryDark',
    sizes: {
      small: 'px-1.5 py-1 text-xs',
      base: 'px-2 py-1 text-base',
      large: 'px-2 py-1 text-lg',
      extra_large: 'px-2 py-1 text-2xl',
      full_h: 'h-full',
      full_w: 'w-full',
    },
    iconEnabled: 'text-primary dark:text-primaryDark',
    iconEnabledLighterOnDark: 'text-primary dark:text-primaryLight',
    iconDisabled: 'text-gray-500 dark:text-gray-400',
  },
  input: {
    base: 'block w-full relative focus:z-[8] disabled:cursor-not-allowed bg-bgInput dark:bg-bgInputDark text-gray-900  dark:text-gray-100  disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:border-gray-700 dark:disabled:bg-gray-900 dark:disabled:text-gray-400',
    label: 'text-sm font-medium text-inputText dark:text-inputTextDark',
    placeholder: {
      base: 'placeholder:text-placeHolderInputText dark:placeholder:text-placeHolderInputTextDark',
      error: '',
    },
    helper: {
      base: 'mt-2 text-sm',
      color: {
        base: 'text-gray-500 dark:text-gray-400',
        error: 'text-rose-600 dark:text-rose-400',
      },
    },
    size: {
      base: 'px-3 py-2 text-sm',
      large: 'px-4 py-3 text-base',
    },
    colors: {
      gray: 'border-gray-300 focus:border-primaryLight focus:ring-primaryLight placeholder:text-gray-400 dark:border-gray-600 dark:focus:border-primaryDark dark:focus:ring-primaryDark dark:placeholder:text-gray-500',
      error:
        'border-rose-500 focus:border-rose-500 focus:ring-rose-500 dark:border-rose-400 dark:focus:border-rose-400 dark:focus:ring-rose-400',
    },
    icon: {
      base: 'absolute flex items-center z-[9]',
      gray: 'text-inputIcon dark:text-inputIconDark autofill:text-red-500',
      red: 'text-red-500 dark:text-red-400',
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
      base: 'relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg bg-white dark:bg-gray-900',
      transition: {
        enter: 'ease-out duration-300',
        enterFrom: 'opacity-0',
        enterTo: 'opacity-100',
        leave: 'ease-in duration-200',
        leaveFrom: 'opacity-100',
        leaveTo: 'opacity-0',
      },
    },
    content:
      'px-4 pt-5 pb-4 sm:p-6 sm:pb-4 sm:flex sm:items-start bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100',
    background: {
      base: 'fixed inset-0 bg-opacity-75 dark:bg-opacity-75 transition-opacity bg-gray-500 dark:bg-gray-500',
      transition: {
        enter: 'ease-out duration-300',
        enterFrom: 'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95',
        enterTo: 'opacity-100 translate-y-0 sm:scale-100',
        leave: 'ease-in duration-200',
        leaveFrom: 'opacity-100 translate-y-0 sm:scale-100',
        leaveTo: 'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95',
      },
    },
    actions: 'px-4 py-3 flex flex-col sm:flex-row-reverse  sm:px-6 gap-3 bg-white dark:bg-gray-900',
    sizes: {
      base: '',
      large: '',
    },
  },
  status: {
    available: {
      badge: {
        base: 'bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100',
      },
      avatar: {
        dot: 'bg-emerald-500 dark:bg-emerald-500',
      },
      card: {
        border: 'border-green-500 dark:border-green-500',
      },
    },
    online: {
      badge: {
        base: 'bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100',
      },
      avatar: {
        dot: 'bg-green-500 dark:bg-green-500',
      },
      card: {
        border: 'border-emerald-500 dark:border-emerald-500',
      },
    },
    dnd: {
      badge: {
        base: 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100',
      },
      avatar: {
        dot: 'bg-gray-950 dark:bg-gray-950',
      },
      card: {
        border: 'border-gray-500 dark:border-green-500',
      },
    },
    voicemail: {
      badge: {
        base: 'bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100',
      },
      avatar: {
        dot: 'bg-green-500 dark:bg-green-500',
      },
      card: {
        border: 'border-orange-500 dark:border-orange-500',
      },
    },
    cellphone: {
      badge: {
        base: 'bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100',
      },
      avatar: {
        dot: 'bg-green-500 dark:bg-green-500',
      },
      card: {
        border: 'border-purple-500 dark:border-purple-500',
      },
    },
    callforward: {
      badge: {
        base: 'bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100',
      },
      avatar: {
        dot: 'bg-green-500 dark:bg-green-500',
      },
      card: {
        border: 'border-yellow-500 dark:border-yellow-500',
      },
    },
    busy: {
      badge: {
        base: 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100',
      },
      avatar: {
        dot: 'bg-red-500 dark:bg-red-500',
      },
      card: {
        border: 'border-red-500 dark:border-red-500',
      },
    },
    incoming: {
      badge: {
        base: 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100',
      },
      avatar: {
        dot: 'bg-red-500 dark:bg-red-500',
      },
      card: {
        border: 'border-sky-500 dark:border-sky-500',
      },
    },
    ringing: {
      badge: {
        base: 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100',
      },
      avatar: {
        dot: 'bg-red-500 dark:bg-red-500',
      },
      card: {
        border: 'border-sky-500 dark:border-sky-500',
      },
    },
    offline: {
      badge: {
        base: 'bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      },
      avatar: {
        dot: 'bg-gray-500 dark:bg-gray-500',
      },
      card: {
        border: 'border-gray-500 dark:border-gray-500',
      },
    },
    category: {
      badge: {
        base: 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100',
      },
    },
  },
  statusDot: {
    base: 'block ring-2 ring-white rounded-full',
    sizes: {
      extra_small: 'h-1.5 w-1.5',
      small: 'h-2 w-2',
      base: 'h-2.5 w-2.5',
      large: 'h-3 w-3',
      extra_large: 'h-3.5 w-3.5',
    },
  },
  badge: {
    base: 'inline-flex font-medium items-center',
    rounded: {
      base: 'rounded',
      full: 'rounded-full',
    },
    sizes: {
      base: 'px-3 py-2 text-xs',
      small: 'px-2 py-1 text-xs',
      large: 'px-3 py-1 text-sm',
    },
  },
  avatar: {
    base: 'relative block shrink-0',
    sizes: {
      extra_small: 'h-6 w-6 text-xs',
      small: 'h-8 w-8 text-sm',
      base: 'h-10 w-10 text-base',
      large: 'h-12 w-12 text-lg',
      extra_large: 'h-24 w-24 text-3xl',
    },
    group: 'flex -space-x-4 w-fit',
    reverse: 'flex-row-reverse space-x-reverse',
    image: 'w-full h-full',
    bordered: 'border-2 border-white dark:border-gray-700',
    initials: {
      base: 'text-white w-full h-full flex justify-center items-center font-medium leading-none',
      background: 'bg-gray-500 dark:bg-gray-500',
    },
    placeholder: {
      base: 'w-full h-full',
      background: 'bg-gray-100',
    },
    placeholderType: {
      base: 'text-white dark:text-gray-950 w-full h-full fill-white flex justify-center items-center',
      background: 'bg-gray-700 dark:bg-gray-200',
      sizes: {
        extra_small: 'h-3 w-3',
        small: 'h-4 w-4',
        base: 'h-5 w-5',
        large: 'h-6 w-6',
        extra_large: 'h-11 w-11',
      },
    },
    status: {
      base: 'absolute bottom-0 right-0 block ring-2 ring-white rounded-full',
      sizes: {
        circular: {
          extra_small: 'h-1.5 w-1.5',
          small: 'h-2 w-2',
          base: 'h-2.5 w-2.5',
          large: 'h-3 w-3',
          extra_large: 'h-5 w-5',
        },
        rounded: {
          extra_small: 'h-1.5 w-1.5 translate-y-1/2 translate-x-1/2',
          small: 'h-2 w-2 translate-y-1/2 translate-x-1/2',
          base: 'h-2.5 w-2.5 translate-y-1/2 translate-x-1/2 ',
          large: 'h-3 w-3 translate-y-1/2 translate-x-1/2',
          extra_large: 'h-3.5 w-3.5 translate-y-1/2 translate-x-1/2',
        },
      },
    },
    star: {
      base: 'absolute -top-1 -right-1 block text-gray-500 dark:text-gray-400',
      sizes: {
        extra_small: 'h-2 w-2',
        small: 'h-2 w-2',
        base: 'h-2.5 w-2.5',
        large: 'h-3 w-3',
        extra_large: 'h-4 w-4',
      },
    },
    deleteAvatar: {
      button:
        'absolute -top-1 -right-1 block bg-gray-200 dark:bg-gray-500 hover:bg-gray-400 hover:dark:bg-gray-600 rounded-full h-8 w-8  flex items-center justify-center p-[0.25 rem] text-gray-500 hover:text-gray-300 dark:text-gray-300',
      base: 'h-5 w-5',
    },
    rounded: {
      base: 'rounded-md',
      full: 'rounded-full',
    },
  },
  sideDrawerCloseIcon: {
    base: 'h-5 w-5 cursor-pointer dark:text-gray-200 text-gray-700',
  },
  dropdown: {
    base: 'relative text-left cursor-pointer',
    size: {
      full: 'w-full h-full',
    },
    item: {
      base: 'block px-4 text-sm flex items-center gap-3 mt-1 mb-1 cursor-pointer',
      light: 'text-gray-700 dark:text-gray-300',
      active: 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100',
      icon: 'h-4 w-4 flex text-dropdownText dark:text-dropdownTextDark',
      centered: 'justify-center',
    },
    items: {
      base: 'absolute z-10 origin-top-right rounded-md  shadow-lg ring-1 ring-opacity-5 focus:outline-none bg-white ring-black dark:bg-gray-900 dark:ring-gray-700',
      position: {
        right: 'left-0 w-60 mt-2',
        left: 'right-0 w-60 mt-2',
        top: 'right-[3rem] top-0',
        topCard: 'right-[1.2rem] top-[-1rem]',
        topMultipleItem: 'right-[1.2rem] top-[-3.3rem]',
        bottom: 'bottom-0',
      },
      divider: 'divide-y divide-gray-200 dark:divide-gray-700',
      header: 'block px-4 py-3 text-sm cursor-normal text-gray-700 dark:text-gray-300',
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
    base: 'block max-w-md rounded-lg border shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    wrapper: {
      border: 'border-t-2',
      rounded: 'rounded-lg',
    },
    header: {
      base: 'flex justify-between p-7',
    },
    content: {
      base: 'flex flex-col p-7 gap-1 border-t border-gray-200 dark:border-gray-700',
    },
    actions: {
      base: 'grid grid-cols-2 divide-x h-14 border-t z-30 rounded-b-xl divider-gray-200 border-gray-200 dark:divider-gray-700 dark:border-gray-700',
    },
  },
  inlineNotification: {
    base: 'border-l-4 rounded-md p-4 w-full flex',
    type: {
      info: 'border-blue-400 bg-blue-100 dark:border-blue-500 dark:bg-blue-800',
      error: 'border-rose-500 bg-rose-100 dark:border-rose-300 dark:bg-rose-900',
      warning: 'border-yellow-400 bg-yellow-100 dark:border-yellow-500 dark:bg-yellow-700',
      success: 'border-green-400 bg-green-100 dark:border-green-500 dark:bg-green-800',
    },
    titleStyle: {
      info: 'text-sm font-medium text-blue-800 dark:text-blue-100',
      error: 'text-sm font-medium text-rose-800 dark:text-rose-100',
      warning: 'text-sm font-medium text-yellow-800 dark:text-yellow-100',
      success: 'text-sm font-medium text-green-800 dark:text-green-100',
    },
    iconStyle: {
      info: 'h-4 w-4 relative -top-0.5 text-blue-400 dark:text-blue-300',
      error: 'h-4 w-4 relative -top-0.5 text-rose-700 dark:text-rose-200',
      warning: 'h-4 w-4 relative -top-0.5 text-yellow-600 dark:text-yellow-300',
      success: 'h-4 w-4 relative -top-0.5 text-green-600 dark:text-green-300',
    },
    childrenText: {
      info: 'mt-2 text-sm text-blue-700 dark:text-blue-200',
      error: 'mt-2 text-sm text-rose-700 dark:text-rose-200',
      warning: 'mt-2 text-sm text-yellow-700 dark:text-yellow-200',
      success: 'mt-2 text-sm text-green-700 dark:text-green-200',
    },
  },
  toast: {
    base: 'pointer-events-auto max-w-xl overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 rounded-md py-4 pl-8 pr-16 w-full flex items-center',
    type: {
      info: '',
      error: '',
      warning: '',
      success: '',
      failed: '',
    },
    titleStyle: {
      info: 'text-sm font-medium text-blue-800 dark:text-blue-100',
      error: 'text-sm font-medium text-red-800 dark:text-red-100',
      warning: 'text-sm font-medium text-yellow-800 dark:text-yellow-100',
      success: 'text-sm font-medium text-green-800 dark:text-green-100',
      failed: 'border-green-400 bg-red-100 dark:border-green-500 dark:bg-green-800',
    },
    iconStyle: {
      info: 'h-4 w-4 relative -top-0.5 text-blue-400 dark:text-blue-300',
      error: 'h-4 w-4 relative -top-0.5 text-red-400 dark:text-red-300',
      warning: 'h-4 w-4 relative -top-0.5 text-yellow-600 dark:text-yellow-300',
      success: 'h-4 w-4 relative -top-0.5 text-green-600 dark:text-green-300',
      failed: 'border-green-400 bg-red-100 dark:border-green-500 dark:bg-green-800',
    },
    childrenText: {
      info: 'mt-2 text-sm text-blue-700 dark:text-blue-200',
      error: 'mt-2 text-sm text-red-700 dark:text-red-200',
      warning: 'mt-2 text-sm text-yellow-700 dark:text-yellow-200',
      success: 'mt-2 text-sm text-green-700 dark:text-green-200',
      failed: 'border-green-400 bg-red-100 dark:border-green-500 dark:bg-green-800',
    },
  },
  timePicker: {
    base: 'bg-white mt-1 w-full border-gray-300 dark:bg-gray-900 dark:border-gray-600 dark:disabled:bg-gray-900 dark:disabled:border-gray-700 dark:disabled:text-gray-400 dark:focus:border-primaryDark dark:focus:ring-primaryDark dark:placeholder:text-gray-500 dark:text-gray-100 disabled:bg-gray-50 disabled:border-gray-200 disabled:cursor-not-allowed disabled:text-gray-500 focus:border-primaryLight focus:ring-primaryLight placeholder:text-gray-500 rounded-md sm:text-sm text-gray-900',
  },
  datePicker: {
    base: 'bg-white border-gray-300 dark:bg-gray-900 dark:border-gray-600 dark:disabled:bg-gray-900 dark:disabled:border-gray-700 dark:disabled:text-gray-400 dark:focus:border-primaryDark dark:focus:ring-primaryDark dark:placeholder:text-gray-400 dark:placeholder:text-gray-500 dark:text-gray-100 disabled:bg-gray-50 disabled:border-gray-200 disabled:cursor-not-allowed disabled:text-gray-500 focus:border-primaryLight focus:ring-primaryLight placeholder:text-gray-400 placeholder:text-gray-500 rounded-md sm:text-sm text-gray-900 w-full',
  },
}

export default theme
