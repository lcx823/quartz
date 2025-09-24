import { Date, getDate } from "./Date"
import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import readingTime from "reading-time"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"
import { JSX } from "preact"
import style from "./styles/contentMeta.scss"

interface ContentMetaOptions {
  /**
   * Whether to display reading time
   */
  showReadingTime: boolean
  showComma: boolean
}

const defaultOptions: ContentMetaOptions = {
  showReadingTime: true,
  showComma: true,
}

export default ((opts?: Partial<ContentMetaOptions>) => {
  // Merge options with defaults
  const options: ContentMetaOptions = { ...defaultOptions, ...opts }

  function ContentMetadata({ cfg, fileData, displayClass }: QuartzComponentProps) {
    const text = fileData.text

    // Only proceed if there's text to process
    if (!text) {
      return null
    }

    const segments: (string | JSX.Element)[] = []

    // Add date if available
    if (fileData.dates) {
      const date = getDate(cfg, fileData)
      if (date) { // Ensure date is not null/undefined before rendering
        segments.push(<Date date={date} locale={cfg.locale} />)
      }
    }

    // Display reading time if enabled and text exists
    if (options.showReadingTime) {
      const { minutes, words: _words } = readingTime(text)
      const displayedTime = i18n(cfg.locale).components.contentMeta.readingTime({
        minutes: Math.ceil(minutes),
      })
      segments.push(<span>{displayedTime}</span>)
    }

    // If there are any segments to display, render the paragraph
    if (segments.length > 0) {
      return (
        <p show-comma={options.showComma} class={classNames(displayClass, "content-meta")}>
          {segments}
        </p>
      )
    } else {
      // Return null if no segments were added (e.g., no date, no reading time)
      return null
    }
  }

  ContentMetadata.css = style

  return ContentMetadata
}) satisfies QuartzComponentConstructor
