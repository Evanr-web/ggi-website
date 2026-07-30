/**
 * Custom image input that wraps Sanity's default image field and adds
 * live hero-banner previews at the exact aspect ratios used on the site.
 *
 * Desktop hero: full-width × 320px  → ~4.5:1 (at 1440px viewport)
 * Mobile hero:  full-width × 220px  → ~2.9:1 (at 640px viewport)
 *
 * Uses Sanity's image URL builder so hotspot/crop are respected in the preview.
 */
import { useCallback, useMemo } from 'react'
import { type ObjectInputProps, useClient } from 'sanity'
import { Box, Card, Flex, Text, Stack } from '@sanity/ui'
import imageUrlBuilder from '@sanity/image-url'

// Hero dimensions matching EventLayout.astro
const HERO_PREVIEWS = [
  { label: 'Desktop Hero (1440 × 320)', width: 1440, height: 320 },
  { label: 'Mobile Hero (640 × 220)', width: 640, height: 220 },
] as const

export function HeroImageInput(props: ObjectInputProps) {
  const client = useClient({ apiVersion: '2024-01-01' })
  const builder = useMemo(() => imageUrlBuilder(client), [client])

  // The value is the image object with asset, hotspot, crop
  const imageValue = props.value as any

  const previewUrls = useMemo(() => {
    if (!imageValue?.asset?._ref) return []
    return HERO_PREVIEWS.map((p) => ({
      ...p,
      url: builder
        .image(imageValue)
        .width(p.width)
        .height(p.height)
        .fit('crop')
        .auto('format')
        .url(),
    }))
  }, [imageValue, builder])

  return (
    <Stack space={4}>
      {/* Render the default image input */}
      {props.renderDefault(props)}

      {/* Hero previews — only show when an image is uploaded */}
      {previewUrls.length > 0 && (
        <Card padding={4} radius={2} shadow={1} tone="transparent">
          <Stack space={4}>
            <Text size={1} weight="semibold" muted>
              🖼️ Hero Banner Preview — this is how it will appear on the event page
            </Text>
            {previewUrls.map((preview) => (
              <Stack space={2} key={preview.label}>
                <Text size={0} muted>
                  {preview.label}
                </Text>
                <Card
                  radius={2}
                  overflow="hidden"
                  style={{
                    position: 'relative',
                    width: '100%',
                    paddingBottom: `${(preview.height / preview.width) * 100}%`,
                    background: '#f0f0f0',
                  }}
                >
                  <img
                    src={preview.url}
                    alt={preview.label}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </Card>
              </Stack>
            ))}
            <Text size={0} muted style={{ lineHeight: 1.4 }}>
              💡 Tip: Use the crop & hotspot tool above to control what's visible.
              Keep important content (faces, text) within the center of the image.
            </Text>
          </Stack>
        </Card>
      )}
    </Stack>
  )
}
