'use client'
import React from 'react'
import { Overlay } from '@gluestack-ui/overlay'
import { cssInterop } from 'nativewind'

cssInterop(Overlay, { className: 'style' })
// eslint-disable-next-line
export const Portal = React.forwardRef<
  React.ElementRef<typeof Overlay>,
  React.ComponentProps<typeof Overlay>
>(({ ...props }: React.ComponentProps<typeof Overlay>, ref) => {
  return <Overlay {...props} ref={ref} />
})
