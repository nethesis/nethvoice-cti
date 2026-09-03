import { FC, ReactNode } from 'react'
import { t } from 'i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { getEffectiveCnam } from '../../../lib/history'

interface CallDestinationProps {
  call: any
  // Rendered next to the destination NUMBER (e.g. the queue/ring-group marker),
  // so the badge sits with the number instead of pushing the name around.
  marker?: ReactNode
  callType: string
  operators: any
  mainextension: string
  name: string
  openDrawerHistory: (
    name: string,
    company: string,
    number: string,
    callType: string,
    operators: any,
  ) => void
}

export const CallDestination: FC<CallDestinationProps> = ({
  call,
  marker,
  callType,
  operators,
  mainextension,
  name,
  openDrawerHistory,
}) => {
  // If the destination is a queue (its number matches a configured queue), show
  // the queue NAME (with the number underneath) — for queues/groups we want the
  // name, not just the raw number.
  const queuesStore: any = useSelector((state: RootState) => (state as any).queues)
  const queueName = call?.dst ? queuesStore?.queues?.[call.dst]?.name : ''
  if (queueName) {
    return (
      <div>
        <div className='truncate text-sm text-secondaryNeutral dark:text-secondaryNeutralDark'>
          {queueName}
        </div>
        <div className='flex items-center gap-1.5 text-sm text-textPlaceholder dark:text-textPlaceholderDark'>
          <span className='truncate'>{call.dst}</span>
          {marker}
        </div>
      </div>
    )
  }

  // User call type
  if (callType === 'user') {
    const effectiveDstCnam = getEffectiveCnam(call.dst_cnam, call.dst)
    // Resolve internal extensions via the operators directory when the CDR row
    // carried no name (e.g. synthetic transfer-consultation rows have none).
    let resolvedDstCnam = effectiveDstCnam
    if (resolvedDstCnam === '' && call.dst !== '' && call.dst !== mainextension) {
      const op: any = Object.values(operators || {}).find((o: any) =>
        o?.endpoints?.extension?.find((d: any) => d.id === call.dst),
      )
      if (op?.name) resolvedDstCnam = op.name
    }

    const primaryLabel =
      resolvedDstCnam !== '' && call.dst !== mainextension && resolvedDstCnam !== name
        ? resolvedDstCnam
        : call.dst_ccompany !== ''
        ? call.dst_ccompany
        : call.dst !== mainextension
        ? t('Common.Unknown')
        : t('History.You')

    return (
      <div
        onClick={() =>
          openDrawerHistory(resolvedDstCnam, call.dst_ccompany, call.dst, callType, operators)
        }
      >
        <div
          className={
            'truncate text-secondaryNeutral dark:text-secondaryNeutralDark text-sm' +
            (call.dst !== '' ? ' hover:underline cursor-pointer' : '')
          }
        >
          {primaryLabel}
        </div>
        {call.dst !== '' && call.dst !== mainextension && (
          <div className='flex items-center gap-1.5 text-sm text-textPlaceholder dark:text-textPlaceholderDark'>
            <span className='truncate cursor-pointer hover:underline'>{call.dst}</span>
            {marker}
          </div>
        )}
      </div>
    )
  } else {
    // Check if a user does not have a name and add the name of the operator
    const effectiveDstCnam = getEffectiveCnam(call.dst_cnam, call.dst)
    if (effectiveDstCnam === '') {
      let foundOperator: any = Object.values(operators || {}).find((operator: any) =>
        operator?.endpoints?.extension?.find((device: any) => device.id === call.dst),
      )

      if (foundOperator) {
        call.dst_cnam = foundOperator.name
      }
    }

    // Switchboard call type. Show the resolved name/company; for an unresolved
    // EXTERNAL number show "Unknown" (with the number underneath), as the personal
    // view does. Internal/service numbers with no name show the number itself
    // instead of "Unknown".
    const dstNumber = call.dst != null ? call.dst : ''
    // Resolve the name through getEffectiveCnam like the personal branch does: for
    // external parties Asterisk sets the cnam to the number itself, so reading
    // dst_cnam raw labelled the row with the bare number (hiding the number line)
    // while the personal view showed "Unknown" + number for the same call.
    const resolvedSwitchboardCnam = getEffectiveCnam(call.dst_cnam, dstNumber)
    const isExternalNum = (n: string) => (n || '').replace(/\D/g, '').length > 5
    const switchboardLabel =
      resolvedSwitchboardCnam !== ''
        ? resolvedSwitchboardCnam
        : call.dst_ccompany !== ''
        ? call.dst_ccompany
        : dstNumber !== ''
        ? isExternalNum(dstNumber)
          ? t('Common.Unknown')
          : dstNumber
        : '-'

    return (
      <div
        onClick={() =>
          openDrawerHistory(resolvedSwitchboardCnam, call.dst_ccompany, call.dst, callType, operators)
        }
      >
        <div className='truncate text-sm cursor-pointer hover:underline text-secondaryNeutral dark:text-secondaryNeutralDark'>
          {switchboardLabel}
        </div>
        {dstNumber !== '' && switchboardLabel !== dstNumber && (
          <div className='flex items-center gap-1.5 text-sm text-textPlaceholder dark:text-textPlaceholderDark'>
            <span className='truncate cursor-pointer hover:underline'>{dstNumber}</span>
            {marker}
          </div>
        )}
      </div>
    )
  }
}
