import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

export default function Document() {
  return (
    <Html>
      <Head />
      <body className='bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-100'>
        <Main />
        <NextScript />
        <Script
          src={`config/config.${process.env.NODE_ENV}.js`}
          strategy='beforeInteractive'
        ></Script>
      </body>
    </Html>
  )
}
