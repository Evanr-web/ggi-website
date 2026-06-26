import { useCallback } from 'react'
import { set, unset } from 'sanity'
import { Switch, Card, Flex, Text, Badge } from '@sanity/ui'

export function EnabledToggle(props: any) {
  const { value, onChange } = props

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.checked ? set(true) : set(false))
    },
    [onChange]
  )

  const isEnabled = value !== false

  return (
    <Card padding={3} radius={2} shadow={1} tone={isEnabled ? 'positive' : 'critical'}>
      <Flex align="center" gap={3}>
        <Switch checked={isEnabled} onChange={handleChange} />
        <Flex align="center" gap={2}>
          <Badge tone={isEnabled ? 'positive' : 'critical'} fontSize={1} padding={2}>
            {isEnabled ? '✅ LIVE on website' : '🚫 HIDDEN from website'}
          </Badge>
        </Flex>
      </Flex>
    </Card>
  )
}
