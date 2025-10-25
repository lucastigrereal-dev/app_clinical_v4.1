import { toast as hotToast, type Renderable } from 'react-hot-toast'

export const toast = {
  success: (message: string) => {
    hotToast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#10b981',
        color: '#fff',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#10b981',
      },
    })
  },

  error: (message: string) => {
    hotToast.error(message, {
      duration: 5000,
      position: 'top-right',
      style: {
        background: '#ef4444',
        color: '#fff',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#ef4444',
      },
    })
  },

  info: (message: string) => {
    hotToast(message, {
      duration: 4000,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
        background: '#3b82f6',
        color: '#fff',
      },
    })
  },

  warning: (message: string) => {
    hotToast(message, {
      duration: 4000,
      position: 'top-right',
      icon: '⚠️',
      style: {
        background: '#f59e0b',
        color: '#fff',
      },
    })
  },

  loading: (message: string) => {
    return hotToast.loading(message, {
      position: 'top-right',
      style: {
        background: '#6366f1',
        color: '#fff',
      },
    })
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    }
  ) => {
    return hotToast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        position: 'top-right',
        style: {
          minWidth: '250px',
        },
      }
    )
  },

  dismiss: (toastId?: string) => {
    if (toastId) {
      hotToast.dismiss(toastId)
    } else {
      hotToast.dismiss()
    }
  },

  custom: (content: Renderable) => {
    hotToast.custom(content, {
      duration: 4000,
      position: 'top-right',
    })
  },
}
