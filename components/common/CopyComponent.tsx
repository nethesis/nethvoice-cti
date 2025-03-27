import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClone } from '@fortawesome/free-solid-svg-icons'
import { motion, AnimatePresence } from 'framer-motion'
import { Tooltip } from 'react-tooltip'
import { Button } from './Button'
import { t } from 'i18next'

interface CopyToClipboardProps {
  number: string
  id: string
}

const CopyToClipboard: React.FC<CopyToClipboardProps> = ({ number, id }) => {
  const [showMessage, setShowMessage] = useState(false)

  const handleCopy = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    navigator.clipboard.writeText(number?.trim()).then(() => {
      setShowMessage(true)
      setTimeout(() => setShowMessage(false), 2000)
    })
  }

  return (
    <>
      <div className='relative'>
        <Button
          variant='ghost'
          className='ml-2 h-9 w-9'
          data-tooltip-id={`tooltip-${id}`}
          data-tooltip-content={t('Common.Copy to clipboard') || ''}
          onClick={handleCopy}
        >
          <FontAwesomeIcon className='w-4 h-4 text-green-600' icon={faClone} aria-hidden='true' />
        </Button>
      </div>
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='ml-2 dark:bg-gray-100 bg-gray-800 dark:text-gray-900 text-gray-50 text-xs px-2 py-2 rounded shadow-lg w-40 text-center'
          >
            {t('Common.Copied to clipboard')}
          </motion.div>
        )}
      </AnimatePresence>
      <Tooltip id={`tooltip-${id}`} place='top' />
    </>
  )
}

export default CopyToClipboard
