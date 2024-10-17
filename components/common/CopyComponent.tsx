import React, { useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClone } from '@fortawesome/free-solid-svg-icons'
import { motion, AnimatePresence } from 'framer-motion'
import { Tooltip } from 'react-tooltip'
import { Button } from './Button'
import { t } from 'i18next'

interface CopyComponentProps {
  number: string
  id: string
}

const CopyComponent: React.FC<CopyComponentProps> = ({ number, id }) => {
  const [showMessage, setShowMessage] = useState(false)

  const handleCopy = () => {
    setShowMessage(true)
    setTimeout(() => setShowMessage(false), 2000)
  }

  return (
    <>
      <div className='relative'>
        <CopyToClipboard text={number} onCopy={handleCopy}>
          <Button
            variant='ghost'
            className='ml-2 h-9 w-9'
            data-tooltip-id={`tooltip-${id}`}
            data-tooltip-content={t('Common.Copy to clipboard') || ''}
          >
            <FontAwesomeIcon className='w-4 h-4 text-green-600' icon={faClone} aria-hidden='true' />
          </Button>
        </CopyToClipboard>
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
            {t('Common.Copied in clipboard')}
          </motion.div>
        )}
      </AnimatePresence>
      <Tooltip id={`tooltip-${id}`} place='top' />
    </>
  )
}

export default CopyComponent
