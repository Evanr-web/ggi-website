/**
 * Custom image input that wraps Sanity's default image field and adds
 * live hero-banner previews at the exact aspect ratios used on the site.
 *
 * Reads the sibling `heroSize` field to show the correct preview dimensions:
 *   standard → 1440×320 desktop / 640×220 mobile
 *   tall     → 1440×480 desktop / 640×320 mobile
 *   full     → shows the image at natural aspect ratio (width-only)
 */
import { useMemo } from 'react'
import { type ObjectInputProps, useClient, useFormValue } from 'sanity'
import { Card, Text, Stack } from '@sanity/ui'
import imageUrlBuilder from '@sanity/image-url'

const HERO_SIZES: Record<string, { label: string; desktop: [number, number]; mobile: [number, number] }> = {
  standard: {
    label: 'Standard',
    desktop: [1440, 320],
    mobile: [640, 220],
  },
  tall: {
    label: 'Tall',
    desktop: [1440, 480],
    mobile: [640, 320],
  },
}

export function HeroImageInput(props: ObjectInputProps) {
  const client = useClient({ apiVersion: '2024-01-01' })
  const builder = useMemo(() => imageUrlBuilder(client), [client])

  // Read sibling heroSize field
  const heroSize = (useFormValue(['heroSize']) as string) || 'standard'
  const imageValue = props.value as any

  const sizeConfig = HERO_SIZES[heroSize]

  const previewUrls = useMemo(() => {
    if (!imageValue?.asset?._ref) return []

    // "full" mode — show the image at natural aspect ratio (no height constraint)
    if (!sizeConfig) {
      return [
        {
          label: 'Full — image at natural aspect ratio (no crop)',
          width: 1440,
          height: null as number | null,
          url: builder
            .image(imageValue)
            .width(1440)
            .fit('crop')
            .auto('format')
            .url(),
        },
      ]
    }

    const [dw, dh] = sizeConfig.desktop
    const [mw, mh] = sizeConfig.mobile
    return [
      {
        label: `Desktop Hero (${dw} × ${dh})`,
        width: dw,
        height: dh,
        url: builder.image(imageValue).width(dw).height(dh).fit('crop').auto('format').url(),
      },
      {
        label: `Mobile Hero (${mw} × ${mh})`,
        width: mw,
        height: mh,
        url: builder.image(imageValue).width(mw).height(mh).fit('crop').auto('format').url(),
      },
    ]
  }, [imageValue, builder, sizeConfig])

  return (
    <Stack space={4}>
      {/* Render the default image input */}
      {props.renderDefault(props)}

      {/* Hero previews — only show when an image is uploaded */}
      {previewUrls.length > 0 && (
        <Card padding={4} radius={2} shadow={1} tone="transparent">
          <Stack space={4}>
            <Text size={1} weight="semibold" muted>
              🖼️ Hero Banner Preview ({heroSize === 'full' ? 'Full' : sizeConfig?.label || 'Standard'})
            </Text>
            {previewUrls.map((preview) => (
              <Stack space={2} key={preview.label}>
                <Text size={0} muted>
                  {preview.label}
                </Text>
                <Card
                  radius={2}
                  overflow="hidden"
                  style={
                    preview.height
                      ? {
                          position: 'relative' as const,
                          width: '100%',
                          paddingBottom: `${(preview.height / preview.width) * 100}%`,
                          background: '#f0f0f0',
                        }
                      : {
                          width: '100%',
                          background: '#f0f0f0',
                        }
                  }
                >
                  <img
                    src={preview.url}
                    alt={preview.label}
                    style={
                      preview.height
                        ? {
                            position: 'absolute' as const,
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover' as const,
                            display: 'block',
                          }
                        : {
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                          }
                    }
                  />
                </Card>
              </Stack>
            ))}
            <Text size={0} muted style={{ lineHeight: 1.4 }}>
              💡 Use the crop & hotspot tool above to control what's visible.
              Change "Hero Banner Size" below to see different preview sizes.
            </Text>
          </Stack>
        </Card>
      )}
    </Stack>
  )
}
